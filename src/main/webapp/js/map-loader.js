let newMap;
let editMarker;

function createMap (){
  // var markers = new Array();
  // fetch('/map').then((response) => {
  //   return response.json();
  // }).then((earthquakes) => {
  //   const map = new google.maps.Map(document.getElementById('map'), {
  //     center: {lat: 35.78613674, lng: -119.4491591},
  //     zoom: 7
  //   });

  //   earthquakes.forEach((earthquake) => {
  //     var marker = new google.maps.Marker({
  //       position: {lat: earthquake.lat, lng: earthquake.lng},
  //       map: map
  //     })
  //     markers.push(marker);
  //   });

  //   var markerCluster = new MarkerClusterer(map, markers,
  //     {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
  // })

  newMap = new google.maps.Map(document.getElementById('newMap'), {
    center: {lat: 38.5949, lng: -94.8923},
    zoom: 4
  });

  newMap.addListener('click', (event) => {
    createMarkerForEdit(event.latLng.lat(), event.latLng.lng());
  });
  fetchMarkers();
}

function createMarkerForEdit(lat, lng){
  if(editMarker){
    editMarker.setMap(null);
  }
  editMarker = new google.maps.Marker({
    position: {lat: lat, lng: lng},
    map: newMap
  });
  const infoWindow = new google.maps.InfoWindow({
    content: buildInfoWindowInput(lat, lng)
  });
  google.maps.event.addListener(infoWindow, 'closeclick', () => {
    editMarker.setMap(null);
  });
  infoWindow.open(newMap, editMarker);
}

function buildInfoWindowInput(lat, lng){
  const textBox = document.createElement('textarea');
  const button = document.createElement('button');
  button.appendChild(document.createTextNode('Submit'));
  button.onclick = () => {
    postMarker(lat, lng, textBox.value);
    createMarkerForDisplay(lat, lng, textBox.value);
    editMarker.setMap(null);
  };
  const containerDiv = document.createElement('div');
  containerDiv.appendChild(textBox);
  containerDiv.appendChild(document.createElement('br'));
  containerDiv.appendChild(button);
  return containerDiv;
}

function postMarker(lat, lng, content){
  const params = new URLSearchParams();
  params.append('lat', lat);
  params.append('lng', lng);
  params.append('content', content);
  fetch('/markers', {
    method: 'POST',
    body: params
  });
}

function createMarkerForDisplay(lat, lng, content){
  const marker = new google.maps.Marker({
    position: {lat: lat, lng: lng},
    map: newMap
  });
  var infoWindow = new google.maps.InfoWindow({
    content: content
  });
  marker.addListener('click', () => {
    infoWindow.open(newMap, marker);
  });
}

function fetchMarkers(){
  fetch('/markers').then((response) => {
    return response.json();
  }).then((markers) => {
    markers.forEach((marker) => {
      createMarkerForDisplay(marker.lat, marker.lng, marker.content)
    });
  });
}
