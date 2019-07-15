const RADIUS_INCREASE_RATE = 2;
const EARTH_CIRCUMFERENCE = 40075000; // should only consider radius <= EARTH_CIRCUMFERENCE / 2
const INITIAL_RADIUS = 1000; // 1 kilometer

let radius = 0; // increase exponentially by RADIUS_INCREASE_RATE

let messageList = [];
let markerList = [];
let centerCircle = null;

function adjustCircle(center, radius) {
  if (centerCircle == null) {
    centerCircle = new google.maps.Circle({
      strokeColor: '#0000FF',
      strokeOpacity: 0.8,
      strokeWeight: 1,
      fillColor: '#0000FF',
      fillOpacity: 0.35,
      map: map,
      center: center,
      radius: radius
    });
  } else {
    centerCircle.setCenter(center);
    centerCircle.setRadius(radius);
  }
  map.fitBounds(centerCircle.getBounds());
}

function getDistance(a, b) {
  return google.maps.geometry.spherical.computeDistanceBetween(a, b);
}

function getMaxDistance(center, messageList) {
  let res = 0;
  for (let i = 0; i < messageList.length; ++i) {
    res = Math.max(res, getDistance(map.getCenter(), toLatLng(messageList[i].location)));
  }
  return res;
}

function toLatLng(position) {
  return new google.maps.LatLng(position.latitude, position.longitude);
}

function fetchMessagesInRange(lowerbound, upperbound) {
  var params = {
    lowerbound: lowerbound,
    upperbound: upperbound,
    latitude: map.getCenter().lat(),
    longitude: map.getCenter().lng()
  };

  var esc = encodeURIComponent;
  var query = Object.keys(params).map(k => esc(k) + '=' + esc(params[k])).join('&');
  return fetch('/search?' + query).then((response) => {
    return response.json();
  }).then((newMessageList) => {
    return newMessageList;
  });
}

function updateSearchResults(newMessageList) {
  const feed = document.getElementsByClassName("public-feed")[0];
  newMessageList.forEach((message) => {
    latlng = toLatLng(message.location);
    markerList.push(new google.maps.Marker({
      map: map,
      position: latlng
    }));

    let distance = getDistance(latlng, map.getCenter()) / 1000.0;
    feed.innerHTML += `<div class="post">
      <div class="post-header">
        <h2 class="post-uploader">${message.user}</h2>
        <span class="dot">·</span>
        <h3 class="post-date">${moment(message.timestamp).toNow(true)}</h3>
      </div>
      <div class="post-header">
        <h2 class="post-location">Location: ${message.location.latitude} ${message.location.longitude} | Distance: ${distance.toFixed(2)} km</h2>
      </div>
      <div class="post-content">            
        <div class="post-content--text">${message.text}</div>
        <div class="post-translate--trigger" onclick="requestTranslation(this);">
          <i class="fas fa-globe-americas"></i>
          <span>Translate Post</span>
        </div>
      </div>
    </div>`;
  });
  messageList = messageList.concat(newMessageList);
  document.getElementsByClassName("message-count")[0].innerHTML = `
    <h2>${messageList.length}</h2>
    <h2>post${messageList.length > 1 ? "s" : ""}</h2>
  `;

  adjustCircle(map.getCenter(), radius);
}

function fetchMoreMessages() {
  let newRadius = Math.max(radius * RADIUS_INCREASE_RATE, 1000);
  if (newRadius >= EARTH_CIRCUMFERENCE) return;
  fetchMessagesInRange(radius, newRadius).then((newMessageList) => {
    radius = newRadius;

    if (newMessageList.length == 0) {
      fetchMoreMessages();
      return;
    }

    updateSearchResults(newMessageList);
    
    // let maxDistance = getMaxDistance(map.getCenter(), messageList) * 1.1;
    // setRadius(maxDistance);

  });
}

function initSearch() {
  currentLocationMarker.setMap(null);
  map.setOptions({draggable: false});
  tryCurrentLocation(fetchMoreMessages);
}
