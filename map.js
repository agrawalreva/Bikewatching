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

const tooltip = d3.select("body").append("div")
  .attr("id", "tooltip")
  .style("position", "absolute")
  .style("visibility", "hidden")
  .style("background", "white")
  .style("padding", "5px")
  .style("border", "1px solid black")
  .style("border-radius", "5px")
  .style("z-index", "1000");

document.addEventListener("DOMContentLoaded", () => {
  const timeSlider = document.getElementById("time-slider");
  const selectedTime = document.getElementById("selected-time");
  const anyTimeLabel = document.getElementById("any-time");
  let timeFilter = -1;

  function formatTime(minutes) {
    const date = new Date(0, 0, 0, 0, minutes);
    return date.toLocaleString('en-US', { timeStyle: 'short' });
  }

  function minutesSinceMidnight(date) {
    return date.getHours() * 60 + date.getMinutes();
  }

  function filterByMinute(tripsByMinute, minute) {
    if (minute === -1) {
      return tripsByMinute.flat(); // Return all trips if no filtering is applied
    }
  
    let minMinute = (minute - 60 + 1440) % 1440;
    let maxMinute = (minute + 60) % 1440;
  
    if (minMinute > maxMinute) {
      let beforeMidnight = tripsByMinute.slice(minMinute);
      let afterMidnight = tripsByMinute.slice(0, maxMinute);
      return beforeMidnight.concat(afterMidnight).flat();
    } else {
      return tripsByMinute.slice(minMinute, maxMinute).flat();
    }
  }

  function computeStationTraffic(stations, timeFilter = -1) {
    const departures = d3.rollup(
      filterByMinute(departuresByMinute, timeFilter),
      (v) => v.length,
      (d) => d.start_station_id
    );
  
    const arrivals = d3.rollup(
      filterByMinute(arrivalsByMinute, timeFilter),
      (v) => v.length,
      (d) => d.end_station_id
    );
  
    return stations.map(station => {
      let id = station.short_name;
      station.arrivals = arrivals.get(id) ?? 0;
      station.departures = departures.get(id) ?? 0;
      station.totalTraffic = station.arrivals + station.departures;
      return station;
    });
  }

let departuresByMinute = Array.from({ length: 1440 }, () => []);
let arrivalsByMinute = Array.from({ length: 1440 }, () => []);


  map.on('load', async () => {
    const svg = d3.select('#map').append('svg');
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


    let jsonData;
    try {
      const jsonurl = "https://dsc106.com/labs/lab07/data/bluebikes-stations.json";
      jsonData = await d3.json(jsonurl);
      console.log('Loaded JSON Data:', jsonData);
    } catch (error) {
      console.error('Error loading JSON:', error);
    }
    let stations = jsonData.data.stations;

    function getCoords(station) {
      const point = new mapboxgl.LngLat(+station.lon, +station.lat); 
      const { x, y } = map.project(point); 
      return { cx: x, cy: y }; 
    }

    let trips;
    try {
      const csvurl = "https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv";
      trips = await d3.csv(csvurl, (trip) => {
        trip.started_at = new Date(trip.started_at);
        trip.ended_at = new Date(trip.ended_at);
      
        let startedMinutes = minutesSinceMidnight(trip.started_at);
        let endedMinutes = minutesSinceMidnight(trip.ended_at);
      
        departuresByMinute[startedMinutes].push(trip);
        arrivalsByMinute[endedMinutes].push(trip);
      
        return trip;
      });
      console.log('Traffic Data Loaded:', trips.length, 'entries');
    } catch (error) {
      console.error('Error loading CSV:', error);
    }
    
    stations = computeStationTraffic(stations);
    const radiusScale = d3.scaleSqrt()
      .domain([0, d3.max(stations, d => d.totalTraffic)])
      .range([0, 25]);

    const circles = svg.selectAll("circle")
      .data(stations, d => d.short_name)
      .enter()
      .append("circle")
      .attr("fill", "steelblue")
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("fill-opacity", 0.6)
      .attr("pointer-events", "auto")
      .on("mouseover", function (event, d) {
        tooltip.style("visibility", "visible")
          .text(`${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`);
      })
      .on("mousemove", function (event) {
        tooltip.style("top", `${event.pageY + 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
      });

      function updatePositions() {
        circles
          .attr("cx", d => getCoords(d).cx)
          .attr("cy", d => getCoords(d).cy)
          .attr("r", d => radiusScale(d.totalTraffic));
      }
    
      updatePositions();
      map.on("move", updatePositions);
      map.on("zoom", updatePositions);
      map.on("resize", updatePositions);
      map.on("moveend", updatePositions);

    function updateScatterPlot(timeFilter) {
      const filteredStations = computeStationTraffic(stations, timeFilter);
      radiusScale.range(timeFilter === -1 ? [0, 25] : [3, 50]);
      circles.data(filteredStations, d => d.short_name)
        .join("circle")
        .attr("r", d => radiusScale(d.totalTraffic));
    }

    function updateTimeDisplay() {
      timeFilter = Number(timeSlider.value);
      if (timeFilter === -1) {
        selectedTime.textContent = "";
        anyTimeLabel.style.display = "block";
      } else {
        selectedTime.textContent = formatTime(timeFilter);
        anyTimeLabel.style.display = "none";
      }
      updateScatterPlot(timeFilter);
    }

    timeSlider.addEventListener("input", updateTimeDisplay);
    updateTimeDisplay();
  });
});
