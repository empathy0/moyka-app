var map; // Define map variable in a higher scope
var data; // Define data variable in a higher scope
var marker;
var resultsContainer = document.getElementById('results-container');

mapboxgl.accessToken = 'pk.eyJ1IjoibXVyYWRndWxpeWV2IiwiYSI6ImNscnBjcWs1ZDAzemQyam96N3BvNW9xbm8ifQ._VwTkZP6y0MNQmYeR2K5Og';

function updateMap(filteredData) {
  // Remove existing markers from the map
  // This depends on how you've added markers initially
  // Clear existing markers on the map
  marker.remove();
  // Add new markers based on the filtered data
  filteredData.forEach(feature => {
      const coordinates = feature.geometry.coordinates;
      const popupContent = `
          <strong>${feature.properties.name}</strong><br>
          Rating: ${feature.properties.rating}<br>
          Address: ${feature.properties.address}<br>
          <!-- <a href="${feature.properties.link}" target="_blank">Link</a> -->
          <button onclick="openInWaze(${coordinates[1]}, ${coordinates[0]})">Waze-də aç</button>
          <button onclick="openInGoogleMaps(${coordinates[1]}, ${coordinates[0]})">Google Maps-da aç</button>
      `;   
      
      // Update the marker properties dynamically
      marker.setLngLat(coordinates)
        .setPopup(new mapboxgl.Popup().setHTML(popupContent))
        .addTo(map);

      // Add the marker class
      marker.getElement().classList.add("found-marker");
    });
}

function updateResultsContainer(results) {
  // const resultsContainer = document.getElementById('results-container');
  resultsContainer.innerHTML = ''; // Clear previous results

  results.forEach(result => {
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';
    resultItem.innerHTML = `<strong>${result.properties.name}</strong><br>
                            Rating: ${result.properties.rating}<br>
                            Address: ${result.properties.address}<br>
                            <button onclick="openInWaze(${result.geometry.coordinates[1]}, ${result.geometry.coordinates[0]})">Waze-də aç</button>
                            <button onclick="openInGoogleMaps(${result.geometry.coordinates[1]}, ${result.geometry.coordinates[0]})">Google Maps-da aç</button>`;
    resultsContainer.appendChild(resultItem);

    // Add click event listener to zoom to the selected result on the map
    resultItem.addEventListener('click', function () {
      map.flyTo({
        center: result.geometry.coordinates,
        zoom: 17
      });
    });
  });
  resultsContainer.style.display = 'block';
}

function performSearch() {
  // Get the search query from the input element
  const searchQuery = document.getElementById('searchInput').value.toLowerCase();

  if (data && data.features) {
    // Filter your data based on the search query
    const filteredData = data.features.filter(feature => {
      return feature.properties.name.toLowerCase().includes(searchQuery);
    });

    updateResultsContainer(filteredData);
    updateMap(filteredData);
  } else {
    console.error('Error: GeoJSON data is not available or has an unexpected format.');
  }
}
function closeResultsContainer() {
  document.getElementById('results-container').innerHTML = ''; // Clear results
}
function processDataAndMap() {
  // Add GeoJSON data as a source
  map.addSource('some-points', { type: 'geojson', data: data });

  // Add markers for each point feature
  data.features.forEach(function(feature) {
      var coordinates = feature.geometry.coordinates;
      var popupContent = `
          <strong>${feature.properties.name}</strong><br>
          Rating: ${feature.properties.rating}<br>
          Address: ${feature.properties.address}<br>
          <!-- <a href="${feature.properties.link}" target="_blank">Link</a> -->
          <button onclick="openInWaze(${coordinates[1]}, ${coordinates[0]})">Waze-də aç</button>
          <button onclick="openInGoogleMaps(${coordinates[1]}, ${coordinates[0]})">Google Maps-da aç</button>
      `;          
      // var markerId = feature.id;

      // Create a single marker for the entire map
      marker = new mapboxgl.Marker();

      // Create a new marker and add it to the map
      marker.setLngLat(coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(popupContent))
          .addTo(map);
  });
}

(function() {
  map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [49.8302375129846, 40.39577415685276],
      zoom: 9
  });
  
  // Add geolocate control to the map.
  map.addControl(
    new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        // When active the map will receive updates to the device's location as it changes.
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which direction the device is heading.
        showUserHeading: true
    })
  );

  map.on('load', function() {
    // Fetch GeoJSON data from file
    fetch('https://raw.githubusercontent.com/empathy0/moyka-app/0ad3c8c498804d15f74a8aeb156aa14de48214d3/data_geojson.json')
    .then(response => response.json())
    .then(fetchedData => {
        // Assign the fetched data to the global variable
        data = fetchedData;

        // Process the data and update the map
        processDataAndMap();
    })
    .catch(error => console.error('Error fetching GeoJSON:', error));       
    // Close the results container when clicking on the map
    
  });

  map.on('click', function () {
    resultsContainer.style.display = 'none';
  });
  // Function to open location in Waze
  window.openInWaze = function(lat, lon) {
    window.open(`https://www.waze.com/ul?ll=${lat},${lon}&navigate=yes`);
  };

  // Function to open location in Google Maps
  window.openInGoogleMaps = function(lat, lon) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`);
  };

})();
