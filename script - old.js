var map; // Define map variable in a higher scope
var data; // Define data variable in a higher scope

mapboxgl.accessToken = 'pk.eyJ1IjoibXVyYWRndWxpeWV2IiwiYSI6ImNscnBjcWs1ZDAzemQyam96N3BvNW9xbm8ifQ._VwTkZP6y0MNQmYeR2K5Og';

function updateMap(filteredData) {
  // Remove existing markers from the map
  // This depends on how you've added markers initially

  // Add new markers based on the filtered data
  filteredData.forEach(feature => {
      const coordinates = feature.geometry.coordinates;
      const popupContent = feature.properties.point_source;

      new mapboxgl.Marker()
          .setLngLat(coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(popupContent))
          .addTo(map);
  });
}


function performSearch() {
  // Get the search query from the input element
  const searchQuery = document.getElementById('searchInput').value.toLowerCase();

  // Check if data is defined and has features property
  if (data && data.features) {
    // Filter your data based on the search query
    const filteredData = data.features.filter(feature => {
        // Modify the condition based on your data structure and search requirements
        return feature.properties.name.toLowerCase().includes(searchQuery);
    });

    // Update the map with the filtered data
    updateMap(filteredData);
  } else {
    console.error('Error: GeoJSON data is not available or has an unexpected format.');
  }
}


(function() {
  var map = new mapboxgl.Map({
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
    .then(data => {
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
            var markerId = feature.id;

            // Create a new marker and add it to the map
            new mapboxgl.Marker()
                .setLngLat(coordinates)
                .setPopup(new mapboxgl.Popup().setHTML(popupContent))
                .addTo(map);
        });
    })
    .catch(error => console.error('Error fetching GeoJSON:', error));       
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
