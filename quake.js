
console.log("Mapbox loading...");

mapboxgl.accessToken = 'pk.eyJ1IjoicGluY2hlZ3VydSIsImEiOiJjbWJ5ajczcWExZDdhMnFuMW9kOTFtaWRjIn0.570DDbl4VeSZDM2UCjw0AQ';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [0, 20],
    zoom: 1.5
});

let earthquakes = [];
let currentIndex = 0;
let animationInterval = null;
let isPlaying = false;
let playbackSpeed = 1;
let filteredData = [];
let startDate = null;
let endDate = null;

const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");
const slider = document.getElementById("timeSlider");
const speedSelect = document.getElementById("speed");
const playPauseButton = document.getElementById("playPause");

fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson')
  .then(res => res.json())
  .then(data => {
    earthquakes = data.features.map(f => ({
        time: f.properties.time,
        mag: f.properties.mag,
        coords: f.geometry.coordinates
    }));

    earthquakes.sort((a, b) => a.time - b.time);

    if (earthquakes.length) {
        const minDate = new Date(earthquakes[0].time);
        const maxDate = new Date(earthquakes[earthquakes.length - 1].time);
        startInput.valueAsDate = minDate;
        endInput.valueAsDate = maxDate;
        updateFilteredData();
    }
});

function updateFilteredData() {
    startDate = new Date(startInput.value).getTime();
    endDate = new Date(endInput.value).getTime();

    filteredData = earthquakes.filter(eq => eq.time >= startDate && eq.time <= endDate);

    slider.max = filteredData.length - 1;
    slider.value = 0;
    currentIndex = 0;
    clearMap();
}

function animateNextQuake() {
    if (currentIndex >= filteredData.length) {
        stopAnimation();
        return;
    }

    const quake = filteredData[currentIndex];
    addFlash(quake.coords[0], quake.coords[1], quake.mag);
    slider.value = currentIndex;
    currentIndex++;
}

function addFlash(lon, lat, mag) {
    const size = 10 + mag * 3;
    const el = document.createElement("div");
    el.className = "quake";
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.background = "rgba(255, 100, 0, 0.6)";
    el.style.borderRadius = "50%";

    new mapboxgl.Marker(el)
      .setLngLat([lon, lat])
      .addTo(map);

    setTimeout(() => el.remove(), 3000);
}

function startAnimation() {
    if (animationInterval) clearInterval(animationInterval);
    animationInterval = setInterval(animateNextQuake, 1000 / playbackSpeed);
    isPlaying = true;
    playPauseButton.textContent = "❚❚ Pause";
}

function stopAnimation() {
    clearInterval(animationInterval);
    isPlaying = false;
    playPauseButton.textContent = "▶ Play";
}

function clearMap() {
    const markers = document.querySelectorAll(".mapboxgl-marker");
    markers.forEach(m => m.remove());
}

startInput.addEventListener("change", updateFilteredData);
endInput.addEventListener("change", updateFilteredData);
speedSelect.addEventListener("change", () => {
    playbackSpeed = parseFloat(speedSelect.value);
    if (isPlaying) {
        startAnimation();
    }
});
slider.addEventListener("input", () => {
    currentIndex = parseInt(slider.value);
    clearMap();
    for (let i = 0; i <= currentIndex; i++) {
        const quake = filteredData[i];
        addFlash(quake.coords[0], quake.coords[1], quake.mag);
    }
});
playPauseButton.addEventListener("click", () => {
    isPlaying ? stopAnimation() : startAnimation();
});
