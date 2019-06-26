/*
 * Copyright 2019 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Get ?user=XYZ parameter value
const urlParams = new URLSearchParams(window.location.search);
const parameterUsername = urlParams.get("user");

// URL must include ?user=XYZ parameter. If not, redirect to homepage.
if (!parameterUsername) {
  window.location.replace("/");
}

/** Sets the page title based on the URL parameter username. */
function setPageTitle() {
  document.title = parameterUsername + " - User Page";
  document.getElementsByClassName("username")[0].innerHTML = parameterUsername;
}

/**
 * Shows the message form if the user is logged in and viewing their own page.
 */
function showMessageFormIfViewingSelf() {
  fetch("/login-status")
    .then((response) => {
      return response.json();
    })
    .then((loginStatus) => {
      if (loginStatus.isLoggedIn && loginStatus.username == parameterUsername) {
        const messageForm = document.getElementById("message-form");
        messageForm.classList.remove("hidden");
      }
    });
}

/** Fetches messages and add them to the page. */
function fetchMessages() {
  const url = "/messages?user=" + parameterUsername;
  fetch(url)
    .then((response) => response.json())
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
      document.getElementsByClassName("message-count")[0].innerHTML = `
        <h2>${messageList.length}</h2>
        <h2>post${messageList.length > 1 ? "s" : ""}</h2>
      `;
    });
}

/** Fetches data and populates the UI of the page. */
function buildUI() {
  setPageTitle();
  showMessageFormIfViewingSelf();
  fetchMessages();
}

function clearFileInput() {
  document.querySelectorAll(".actions input")[0].value = "";
  document.getElementById("message-form").classList.remove("file-uploaded");
}

function handleUploadFile(e) {
  if (e.target.files.length > 0) {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    const previewer = document.getElementsByClassName("thumbnail-preview")[0];
    previewer.innerHTML = `<div class="thumbnail">
      <img src="${url}" />
      <div class="close-btn" onclick="clearFileInput();">
        <i class="fas fa-times"></i>
      </div>
    </div>`;
    document.getElementById("message-form").classList.add("file-uploaded");
  }
}
