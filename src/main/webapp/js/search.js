const RADIUS_INCREASE_RATE = 1.5;
const EARTH_CIRCUMFERENCE = 40075000; // should only consider radius <= EARTH_CIRCUMFERENCE / 2
const RADIUS_LIMIT = 100000; // 100 km
const INITIAL_RADIUS = 250; // 250 meters

let radius = 0; // increase exponentially by RADIUS_INCREASE_RATE

let messageList = [];
let markerList = [];
let centerCircle = null;
let centerMarker = null;
let searchCenter = null;

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
    res = Math.max(res, getDistance(center, toLatLng(messageList[i].location)));
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
    latitude: searchCenter.lat(),
    longitude: searchCenter.lng()
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
  const feed = document.getElementById("feed");
  newMessageList.forEach((message) => {
    latlng = toLatLng(message.location);
    markerList.push(new google.maps.Marker({
      map: map,
      position: latlng
    }));

    let distance = getDistance(latlng, searchCenter) / 1000.0;
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

  radius = getMaxDistance(searchCenter, messageList) * 1.1;

  document.getElementsByClassName("message-count")[0].innerHTML = `
    <h2>Search radius: </h2>
    <h2>${(radius / 1000.0).toFixed(2)} km</h2>
  `;
  document.getElementsByClassName("message-count")[1].innerHTML = `
    <h2>${messageList.length}</h2>
    <h2>post${messageList.length > 1 ? "s" : ""}</h2>
  `;

  adjustCircle(searchCenter, radius);
}

function fetchMoreMessages(from, to) {
  if (from === undefined) {
    from = radius;
    to = radius * RADIUS_INCREASE_RATE;
  }
  to = Math.min(to, RADIUS_LIMIT);
  if (from > to) return;

  fetchMessagesInRange(from, to).then((newMessageList) => {
    radius = to;

    if (newMessageList.length == 0) {
      fetchMoreMessages();
      return;
    }

    updateSearchResults(newMessageList);
  });
}

function firstSearch() {
  searchCenter = currentLocation;
  fetchMoreMessages(0, INITIAL_RADIUS);
}

function resetSearch() {
  radius = 0;
  searchCenter = null;
  document.getElementById("feed").innerHTML = "";
  for (let marker of markerList) {
    marker.setMap(null);
  }
  markerList = [];
  messageList = [];
}

function initSearch() {
  centerMarker = new google.maps.Marker({
    map: null,
    position: map.getCenter(),
    icon: {
      url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
      size: new google.maps.Size(20, 32),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 32)
    }
  });
  map.addListener('dragend', function() {
    if (google.maps.geometry.spherical.computeDistanceBetween(map.getCenter(), searchCenter) >= radius) {
      let previousRadius = radius;
      resetSearch();
      searchCenter = map.getCenter();
      fetchMoreMessages(0, previousRadius);
    }
    centerMarker.setMap(null);
  });
  map.addListener('drag', function() {
    centerMarker.setPosition(map.getCenter());
    centerMarker.setMap(map);
  });

  resetSearch();
  tryCurrentLocation(firstSearch);
}

document.addEventListener("DOMContentLoaded", () => {
  createMap();
  initSearch();
});