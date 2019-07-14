let map;
let editMarker;

let currentLocation;
let currentLocationMarker;

function initAutocomplete() {
  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
}

function createMap (){
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 38.5949, lng: -94.8923},
    zoom: 15
  });

  initCurrentLocation();

  map.addListener('click', (event) => {
    createMarkerForEdit(event.latLng.lat(), event.latLng.lng());
  });
  fetchMarkers();
  initAutocomplete();
}

function tryCurrentLocation() {
  var imgX = '0';
  var animationInterval = setInterval(function(){
    if (imgX == '-18') imgX = '0'; else imgX = '-18';
    $('#current-location-image').css('background-position', imgX + 'px 0px');
  }, 500);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      currentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.setCenter(currentLocation);
      currentLocationMarker.setPosition(currentLocation);

      clearInterval(animationInterval);
      $('#current-location-image').css('background-position', '-144px 0px');
    });
  } else {
    clearInterval(animationInterval);
    $('#current-location-image').css('background-position', '0px 0px');
    console.println("Geolocation service is not available");
  }
}

function initCurrentLocation() {
  var controlDiv = document.createElement('div');
  var firstChild = document.createElement('button');
  firstChild.id = 'current-location-button';
  controlDiv.appendChild(firstChild);
  var secondChild = document.createElement('div');
  secondChild.id = 'current-location-image';
  firstChild.appendChild(secondChild);

  currentLocationMarker = new google.maps.Marker({
    position: {lat: 38.5949, lng: -94.8923},
    map: map
  });

  google.maps.event.addListener(map, 'dragend', function() {
    $('#current-location-image').css('background-position', '0px 0px');
  });

  firstChild.addEventListener('click', tryCurrentLocation);

  controlDiv.index = 1;
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
}

function createMarkerForEdit(lat, lng) {
  if(editMarker){
    editMarker.setMap(null);
  }
  editMarker = new google.maps.Marker({
    position: {lat: lat, lng: lng},
    map: map
  });
  const infoWindow = new google.maps.InfoWindow({
    content: buildInfoWindowInput(lat, lng)
  });
  google.maps.event.addListener(infoWindow, 'closeclick', () => {
    editMarker.setMap(null);
  });
  infoWindow.open(map, editMarker);
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
    map: map
  });
  var infoWindow = new google.maps.InfoWindow({
    content: content
  });
  marker.addListener('click', () => {
    infoWindow.open(map, marker);
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


function postMessage() {
    const data = new FormData();
    var docForm = document.getElementById("message-form");

    data.append('lat', editMarker.getPosition().lat().toString());
    data.append('lng', editMarker.getPosition().lng().toString());

    for (const pair of new FormData(docForm)) {
        data.append(pair[0], pair[1]);
    }

    console.log(data);

    const uploadUrl = docForm.action;
    fetch(uploadUrl, {
        method: "post",
        body: data,
    })
    .then(function(res){ console.log(res) })
    .catch(function(res){ console.log(res) })
}