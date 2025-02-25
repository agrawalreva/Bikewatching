import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';

mapboxgl.accessToken = 'pk.eyJ1IjoicmV2YWFncmF3YWwiLCJhIjoiY203bDJucXRxMDN4YTJsb3AwbTFxdmw4NCJ9.AC78EcgiiILPdc5zEX5rRQ';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-71.09415, 42.36027],
  zoom: 12,
  minZoom: 5,
  maxZoom: 18
});

console.log("Mapbox GL JS Loaded:", mapboxgl);

map.on('load', async () => {
    console.log("Map fully loaded!");
    map.addSource('boston_route', {
        type: 'geojson',
        data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson'
      });
      map.addLayer({
        id: 'bike-lanes',
        type: 'circle',
        source: 'boston_route',
        paint: {
          'circle-color': 'blue',
          'circle-radius': 5
        }
      });

      map.addSource('cambridge_routes', {
        type: 'geojson',
        data: 'https://data.cambridgema.gov/api/geospatial/w4tj-ht6d?method=export&format=GeoJSON'
      });
      map.addLayer({
        id: 'cambridge-bike-lanes',
        type: 'line',
        source: 'cambridge_routes',
        paint: {
          'line-color': 'blue',
          'line-width': 3,
          'line-opacity': 0.5
        }
      });
  });
  const bikeLaneStyle = {
    'line-color': '#32D400',
    'line-width': 4,
    'line-opacity': 0.5
  };
  
  map.addLayer({ id: 'bike-lanes', type: 'line', source: 'boston_route', paint: bikeLaneStyle });
  map.addLayer({ id: 'cambridge-bike-lanes', type: 'line', source: 'cambridge_routes', paint: bikeLaneStyle });
