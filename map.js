// Import Mapbox GL JS
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';

// Set Mapbox Access Token
mapboxgl.accessToken = 'pk.eyJ1IjoicmV2YWFncmF3YWwiLCJhIjoiY203bDJucXRxMDN4YTJsb3AwbTFxdmw4NCJ9.AC78EcgiiILPdc5zEX5rRQ';

// Initialize the map
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-71.09415, 42.36027], // Boston
  zoom: 12,
  minZoom: 5,
  maxZoom: 18
});

console.log("Mapbox GL JS Loaded:", mapboxgl);
