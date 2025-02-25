// Import Mapbox GL JS
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';

// Set Mapbox Access Token
mapboxgl.accessToken = 'pk.eyJ1IjoicmV2YWFncmF3YWwiLCJhIjoiY203bDIyM2s1MDcyMDJqcHd3OG5zZGl1MCJ9.reoCpN0lmQ-xpy_0vlurrA';

// Initialize the map
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/revaagrawal/cm7l2a6g4003k01ss1ke85ge8',
  center: [-71.09415, 42.36027], // Boston
  zoom: 12,
  minZoom: 5,
  maxZoom: 18
});

console.log("Mapbox GL JS Loaded:", mapboxgl);
