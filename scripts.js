mapboxgl.accessToken = 'pk.eyJ1IjoibW9ja3VzZXIiLCJhIjoiY2s4dmI3bGoyMDBuazNsbnpqM3l4cmZndCJ9.JV7XDl7fgcl8dhFOS4aQ5g';



const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 20],
  zoom: 1.5
});

let markers = [];
let playing = false;

window.togglePlayback = function () {
  console.log("Button was clicked!");

  if (playing) {
    clearMarkers();
    playing = false;
  } else {
    loadEarthquakes();
    playing = true;
  }
};

function loadEarthquakes() {
  fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson')
    .then(res => res.json())
    .then(data => {
      data.features.forEach((quake, i) => {
        setTimeout(() => {
          const coords = quake.geometry.coordinates;
          const mag = quake.properties.mag;
          const el = document.createElement('div');
          el.style.width = `${mag * 4}px`;
          el.style.height = `${mag * 4}px`;
          el.style.background = 'rgba(255,100,0,0.7)';
          el.style.borderRadius = '50%';
          el.style.boxShadow = '0 0 12px 3px rgba(255,100,0,0.5)';
          new mapboxgl.Marker(el)
            .setLngLat([coords[0], coords[1]])
            .addTo(map);
        }, i * 300);
      });
    });
}

function clearMarkers() {
  document.querySelectorAll('.mapboxgl-marker').forEach(m => m.remove());
}
