
$(document).ready(function () {

  var map = L.map('map').setView([48.852969, 2.349903], 13);
  /*L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoibmxhc29sbGUiLCJhIjoiY2wxeXNwYm9mMGZseTNjbWttMzZuamswYyJ9.PiMQBz2HMj4R56RlJi27Ow', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    minZoom: 1
  }).addTo(map);*/

  // add the OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    minZoom: 1,
    tileSize: 512,
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(map);
  //var marker = L.marker([51.5, -0.09]).addTo(map);
  //marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();

});