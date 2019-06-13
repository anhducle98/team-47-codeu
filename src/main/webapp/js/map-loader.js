function createMap (){
  var markers = new Array();
  fetch('/map').then((response) => {
    return response.json();
  }).then((earthquakes) => {
    const map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 35.78613674, lng: -119.4491591},
      zoom: 7
    });

    earthquakes.forEach((earthquake) => {
      var marker = new google.maps.Marker({
        position: {lat: earthquake.lat, lng: earthquake.lng},
        map: map
      })
      markers.push(marker);
    });

    var markerCluster = new MarkerClusterer(map, markers,
      {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
  })
}
