function requestTranslation(div) {
  const post = div.parentElement.parentElement;
  const text = encodeURIComponent(
    post
      .getElementsByClassName("post-content--text")[0]
      .innerHTML.replace(/<img .*?>/g, "\n")
      .replace(/<p>Suggested tags: .*?<\/p>/g, "\n")
  );
  const queryURL = `/translate?text=${text}&sourceLanguageCode=en&targetLanguageCode=vi`;
  fetch(queryURL, { method: "POST" })
    .then((response) => {
      if (response.ok) {
        return response.text();
      }
      throw response;
    })
    .then((result) => {
      div.style.display = "none";
      post.innerHTML += `<div class="post-translate">
        <div class="post-translate__header">
          Translated by <i class="fab fa-google"></i> Google
        </div>
        <div class="post-content translate-result">${result}</div>
      </div>`;
    });
}

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
            <div class="post-content--text">${message.text}</div>
            <div class="post-translate--trigger" onclick="requestTranslation(this);">
              <i class="fas fa-globe-americas"></i>
              <span>Translate Post</span>
            </div>
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
          <a href="${"/user-page.jsp?user=" + user}">
            <button class="application-action">View</button>
          </a>
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

function handleFixedPostButton() {
  const top = window.pageYOffset || document.documentElement.scrollTop;
  if (top >= 100) {
    document.querySelector(".create-post-btn.fixed").classList.add("show");
  } else {
    document.querySelector(".create-post-btn.fixed").classList.remove("show");
  }
}

document.addEventListener("scroll", handleFixedPostButton);
