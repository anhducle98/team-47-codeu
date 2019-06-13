function createMap (){
  fetch('/map').then((response) => {
    return response.json();
  }).then((earthquakes) => {
    const map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 35.78613674, lng: -119.4491591},
      zoom: 7
    });

    earthquakes.forEach((earthquake) => {
      new google.maps.Marker({
        position: {lat: earthquake.lat, lng: earthquake.lng},
        map: map
      });
    });
  })
}
