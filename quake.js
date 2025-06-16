console.log("Mapbox loading...");

mapboxgl.accessToken = 'pk.eyJ1IjoicGluY2hlZ3VydSIsImEiOiJjbWJ5ajczcWExZDdhMnFuMW9kOTFtaWRjIn0.570DDbl4VeSZDM2UCjw0AQ'; // Replace with your actual token

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
let playbackSpeed = 1; // 1x speed by default

const slider = document.getElementById("timeSlider");
const speedSelect = document.getElementById("speed");
const playPauseButton = document.getElementById("playPause");

// Fetch earthquake data for the past 30 days
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson')
  .then(res => res.json())
  .then(data => {
    earthquakes = data.features.map(f => ({
        time: f.properties.time,
        mag: f.properties.mag,
        coords: f.geometry.coordinates
    }));

    // Sort by time ascending
    earthquakes.sort((a, b) => a.time - b.time);
    console.log("Loaded " + earthquakes.length + " earthquake events.");
    
    slider.max = earthquakes.length - 1;
    slider.value = 0;
  })
  .catch(err => console.error("Error loading earthquake data:", err));

// Function to add an earthquake flash marker
function addFlash(lon, lat, mag) {
    const size = 10 + mag * 3;
    const el = document.createElement("div");
    el.className = "quake";
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.background = "rgba(255, 100, 0, 0.6)";
    el.style.borderRadius = "50%";
    el.style.boxShadow = "0 0 12px 3px rgba(255,100,0,0.5)";
    
    new mapboxgl.Marker(el)
      .setLngLat([lon, lat])
      .addTo(map);

    // Remove marker after 3 seconds
    setTimeout(() => el.remove(), 3000);
}

// Function that animates the next earthquake
function animateNextQuake() {
    if (currentIndex >= earthquakes.length) {
        console.log("Reached end of earthquake data.");
        stopAnimation();
        return;
    }

    const quake = earthquakes[currentIndex];
    console.log("Animating quake at index " + currentIndex + " (mag " + quake.mag + ")");
    addFlash(quake.coords[0], quake.coords[1], quake.mag);
    slider.value = currentIndex;
    currentIndex++;
}

// Start animation with an interval based on playbackSpeed
function startAnimation() {
    if (earthquakes.length === 0) {
        console.log("Earthquake data not loaded yet. Cannot start animation.");
        return;
    }
    console.log("Starting animation at speed: " + playbackSpeed + "x");
    if (animationInterval) clearInterval(animationInterval);
    animationInterval = setInterval(() => {
        animateNextQuake();
    }, 1000 / playbackSpeed);
    isPlaying = true;
    playPauseButton.textContent = "❚❚ Pause";
}

// Stop the animation interval
function stopAnimation() {
    if (animationInterval) clearInterval(animationInterval);
    isPlaying = false;
    playPauseButton.textContent = "▶ Play";
}

// Clear all earthquake markers from the map
function clearMap() {
    const markers = document.querySelectorAll(".mapboxgl-marker");
    markers.forEach(m => m.remove());
}

// Event listener for speed control changes
speedSelect.addEventListener("change", () => {
    playbackSpeed = parseFloat(speedSelect.value);
    console.log("Playback speed set to " + playbackSpeed + "x");
    if (isPlaying) {
        startAnimation(); // Restart with the new speed
    }
});

// Event listener for manual slider movement
slider.addEventListener("input", () => {
    currentIndex = parseInt(slider.value);
    console.log("Slider manually set to index " + currentIndex);
    clearMap();
    for (let i = 0; i <= currentIndex; i++) {
        const quake = earthquakes[i];
        addFlash(quake.coords[0], quake.coords[1], quake.mag);
    }
});

// Event listener for play/pause button
playPauseButton.addEventListener("click", () => {
    if (isPlaying) {
        stopAnimation();
    } else {
        // Reset currentIndex if we're starting over
        if (currentIndex >= earthquakes.length) {
            currentIndex = 0;
            slider.value = 0;
            clearMap();
        }
        startAnimation();
    }
});

