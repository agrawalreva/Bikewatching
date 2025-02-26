import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

mapboxgl.accessToken = 'pk.eyJ1IjoicmV2YWFncmF3YWwiLCJhIjoiY203bDJucXRxMDN4YTJsb3AwbTFxdmw4NCJ9.AC78EcgiiILPdc5zEX5rRQ';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-71.09415, 42.36027],
  zoom: 12,
  minZoom: 5,
  maxZoom: 18
});

map.on('load', async () => {
  const svg = d3.select('#map').select('svg');
    console.log("Map fully loaded!");

    // ✅ Add Boston bike lanes
    map.addSource('boston_route', {
      type: 'geojson',
      data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson'
    });

    map.addLayer({
      id: 'bike-lanes',
      type: 'line',
      source: 'boston_route',
      paint: {
        'line-color': '#32D400',
        'line-width': 3,
        'line-opacity': 0.6
      }
    });

    // ✅ Add Cambridge bike lanes
    map.addSource('cambridge_routes', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson'
    });

    map.addLayer({
        id: 'cambridge-bike-lanes',
        type: 'line',
        source: 'cambridge_routes',
        paint: {
            'line-color': '#32D400',
            'line-width': 3,
            'line-opacity': 0.6
        }
    });

    // ✅ Fetch BlueBike station data
    let jsonData;
    try {
        const jsonurl = "https://dsc106.com/labs/lab07/data/bluebikes-stations.json";
        jsonData = await d3.json(jsonurl);
        console.log('Loaded JSON Data:', jsonData);
    } catch (error) {
        console.error('Error loading JSON:', error);
    }
    let stations = jsonData.data.stations;
    console.log('Stations Array:', stations);

    function getCoords(station) {
      const point = new mapboxgl.LngLat(+station.lon, +station.lat);  // Convert lon/lat to Mapbox LngLat
      const { x, y } = map.project(point);  // Project to pixel coordinates
      return { cx: x, cy: y };  // Return as object for use in SVG attributes
    }

    // ✅ Add station markers as circles
    const circles = svg.selectAll("circle")
        .data(stations)
        .enter()
        .append("circle")
        .attr("r", 5) // Circle size
        .attr("fill", "steelblue")
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("opacity", 0.8);

    // ✅ Update circle positions dynamically
    function updatePositions() {
      circles
          .attr("cx", d => getCoords(d).cx)
          .attr("cy", d => getCoords(d).cy);
    }

    updatePositions();
    map.on("move", updatePositions);
    map.on("zoom", updatePositions);
    map.on("resize", updatePositions);
    map.on("moveend", updatePositions);
  });

    // ✅ Convert GPS to pixels
