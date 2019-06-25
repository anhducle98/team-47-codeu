function fetchPublicFeed() {
  fetch("/feed")
    .then((res) => res.json())
    .then((messageList) => {
      const feed = document.getElementsByClassName("public-feed")[0];
      messageList.forEach((message) => {
        feed.innerHTML += `<div class="post">
          <div class="post-header">
            <h2 class="post-uploader">${message.user}</h2>
            <span class="dot">·</span>
            <h3 class="post-date">${moment(message.timestamp).toNow()}</h3>
          </div>
          <div class="post-content">
            ${message.text}
          </div>            
        </div>`;
      });
    });
}

function fetchCommunity() {
  fetch("/user-list")
    .then((res) => res.json())
    .then((userList) => {
      const communityCard = document.querySelectorAll(".sidebar-card.community")[0];
      userList.forEach((user) => {
        communityCard.innerHTML += `<div class="person">
          <div class="person-info">
            <p class="person-name">${user}</p>
          </div>
          <button class="application-action">View</button>
        </div>`;
      });
    });
}

function onBodyLoaded() {
  fetchPublicFeed();
  fetchCommunity();
}
