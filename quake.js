
console.log("Mapbox loading...");

mapboxgl.accessToken = 'pk.eyJ1IjoicGluY2hlZ3VydSIsImEiOiJjbWJ5ajczcWExZDdhMnFuMW9kOTFtaWRjIn0.570DDbl4VeSZDM2UCjw0AQ';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [0, 20],
    zoom: 1.5
});

let isPlaying = false;
const playPauseButton = document.getElementById("playPause");
playPauseButton.addEventListener("click", () => {
    isPlaying = !isPlaying;
    playPauseButton.textContent = isPlaying ? "❚❚ Pause" : "▶ Play";
});

document.getElementById("timeSlider").addEventListener("input", (e) => {
    console.log("Slider moved to:", e.target.value);
});
