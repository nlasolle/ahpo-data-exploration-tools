/**
 * Get details about a geonames resource
 */
function getGeonamesData(person, id) {

    let url = "https://www.geonames.org/getJSON?id=" + id + "&style=json";
    "use strict";
    console.log("ID " + id);
    var request = new XMLHttpRequest();

    request.open("GET", url, true);

    request.onload = function () {
        if (request.status == 200) {
            let results = JSON.parse(this.response);

            let coordinates = {
                lat: results.lat,
                lng: results.lng
            }
            let content = "<h5>" + person.label + "</h5><br>" +
            "<h6> Birth place:" + results.name + ", " + results.countryName + "</h6>";

            addMarker(coordinates, content)
        } else {
            console.log('An error occured when retrieving data ' +
                ' for geonames resource with id '
                + id);
        }
    };

    request.send();
}

function initMap() {
    map = L.map('map').setView([51.3127, 9.4797], 4);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoibmxhc29sbGUiLCJhIjoiY2wxeXNwYm9mMGZseTNjbWttMzZuamswYyJ9.PiMQBz2HMj4R56RlJi27Ow', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 11,
        minZoom: 2,
        zoomControl: false,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
    }).addTo(map);

    map.zoomControl.remove();
    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);
}

function addMarker(coordinates, description) {
    var marker = L.marker([coordinates.lat, coordinates.lng]).addTo(map);
    marker.bindPopup(description).openPopup();
}