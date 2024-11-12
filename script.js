// Initialize the map
var map = L.map('map').setView([40.7128, -74.0060], 13);

// Add tile layers
var streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri, Sources: Esri, DeLorme, NAVTEQ, USGS, and others'
});

let locationsLayer, allLocationsLayer;
var baseMaps = { "Street Map": streetMap, "Satellite Map": satelliteMap };
var controlLayers = L.control.layers(baseMaps).addTo(map);

function createLocationIcon() {
    return L.icon({
        iconUrl: 'img/1.png',
        iconSize: [25, 35],
        iconAnchor: [12, 41]
    });
}

function onLocationClick(feature, layer) {
    layer.on('click', function() {
        document.getElementById('locationInfo').innerHTML = `
            <h3>Food Scrap Location Information</h3>
            <b>Name:</b> ${feature.properties.food_scrap_drop_off_site}<br>
            <b>Address:</b> ${feature.properties.location}<br>
            <b>Hosted By:</b> ${feature.properties.hosted_by}<br>
            <b>Operation Day:</b> ${feature.properties.operation_day_hours}<br>
        `;
    });
}

function displayAllLocations(data) {
    if (allLocationsLayer) {
        map.removeLayer(allLocationsLayer);
    }

    if (!data || !data.features) {
        console.error("No valid data passed to displayAllLocations");
        return;
    }

    const markers = L.markerClusterGroup(); 
    const limitedData = data.features.slice(0, 500); 

    limitedData.forEach(feature => {
        const latlng = [parseFloat(feature.properties.latitude), parseFloat(feature.properties.longitude)];
        if (!isNaN(latlng[0]) && !isNaN(latlng[1])) {
            const marker = L.marker(latlng, { icon: createLocationIcon() });
            marker.on('click', function() {
                document.getElementById('locationInfo').innerHTML = `
                    <h3>Food Scrap Location Information</h3>
                    <b>Name:</b> ${feature.properties.food_scrap_drop_off_site}<br>
                    <b>Address:</b> ${feature.properties.location}<br>
                    <b>Hosted By:</b> ${feature.properties.hosted_by}<br>
                    <b>Operation Day:</b> ${feature.properties.operation_day_hours}<br>
                `;
            });
            markers.addLayer(marker);
        }
    });

    map.addLayer(markers);
    controlLayers.addOverlay(markers, 'Show All Locations');
}

function displayLocations(data) {
    if (locationsLayer) {
        map.removeLayer(locationsLayer);
    }

    data.features.forEach(feature => {
        feature.geometry = {
            type: 'Point',
            coordinates: [
                parseFloat(feature.properties.longitude),
                parseFloat(feature.properties.latitude)
            ]
        };
    });

    locationsLayer = L.geoJSON(data, {
        pointToLayer: (feature, latlng) => L.marker(latlng, { icon: createLocationIcon() }),
        onEachFeature: onLocationClick
    }).addTo(map);
}

let allLocations; // Declare globally
fetch('data.geojson')
    .then(response => response.json())
    .then(data => {
        console.log("GeoJSON data loaded successfully");
        allLocations = data;
        displayAllLocations(allLocations);
    })
    .catch(error => console.error('Error loading the GeoJSON file:', error));

// Use postMessage API to communicate with the iframe
window.onload = function() {
    var iframe = document.getElementById('datawrapper-chart-nQjSO');

    // Check if the iframe exists
    if (iframe) {
        // Listen for messages from the iframe
        window.addEventListener("message", function(event) {
            // Replace with the actual origin of the iframe
            if (event.origin === "https://datawrapper.dwcdn.net/nQjSO/5/") {
                console.log("Message from iframe:", event.data);
                // Handle the message received from the iframe
            }
        }, false);
        
        // Example of sending a message to the iframe (if needed)
        iframe.contentWindow.postMessage("Hello from parent!", "https://datawrapper.dwcdn.net/nQjSO/5/");
    }
};
