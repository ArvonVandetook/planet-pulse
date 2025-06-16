
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

const slider = document.getElementById("timeSlider");
const speedSelect = document.getElementById("speed");
const playPauseButton = document.getElementById("playPause");

// Fetch past 30 days of earthquakes from USGS
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson')
  .then(res => res.json())
  .then(data => {
    earthquakes = data.features.map(f => ({
        time: f.properties.time,
        mag: f.properties.mag,
        coords: f.geometry.coordinates
    }));

    earthquakes.sort((a, b) => a.time - b.time);
    slider.max = earthquakes.length - 1;
    slider.value = 0;
  });

// Add marker flash
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

function animateNextQuake() {
    if (currentIndex >= earthquakes.length) {
        stopAnimation();
        return;
    }

    const quake = earthquakes[currentIndex];
    addFlash(quake.coords[0], quake.coords[1], quake.mag);
    slider.value = currentIndex;
    currentIndex++;
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

speedSelect.addEventListener("change", () => {
    playbackSpeed = parseFloat(speedSelect.value);
    if (isPlaying) {
        startAnimation(); // Restart with new speed
    }
});

slider.addEventListener("input", () => {
    currentIndex = parseInt(slider.value);
    clearMap();
    for (let i = 0; i <= currentIndex; i++) {
        const quake = earthquakes[i];
        addFlash(quake.coords[0], quake.coords[1], quake.mag);
    }
});

playPauseButton.addEventListener("click", () => {
    isPlaying ? stopAnimation() : startAnimation();
});
