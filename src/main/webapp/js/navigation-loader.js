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
            <h3 class="post-date">${moment(message.timestamp).toNow(true)}</h3>
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

function fetchLoginStatus() {
  fetch("/login-status")
    .then((response) => response.json())
    .then((loginStatus) => {
      const loginElement = document.getElementsByClassName("navbar__login")[0];
      if (loginStatus.isLoggedIn) {
        loginElement.innerHTML += `<div class="navbar-item">
          <a href="${"/user-page.jsp?user=" + loginStatus.username}">
            <i class="far fa-user"></i>
            Profile
          </a>
        </div>`;
        loginElement.innerHTML += `<div class="navbar-item">
          <a href="/logout">
            <i class="fas fa-sign-out-alt"></i>
            Sign out
          </a>
        </div>`;
        document.getElementsByTagName("BODY")[0].classList.add("logged-in");

        document.querySelectorAll(".create-post-btn a").forEach((a) => {
          a.setAttribute("href", "/user-page.jsp?user=" + loginStatus.username);
        });
      } else {
        loginElement.innerHTML += `<div class="navbar-item">
          <a href="/login">
            <i class="fas fa-sign-in-alt"></i>
            Sign in
          </a>
        </div>`;
        document.getElementsByTagName("BODY")[0].classList.add("logged-out");
      }
    });
}

function onBodyLoaded() {
  fetchLoginStatus();
  fetchPublicFeed();
  fetchCommunity();
}
