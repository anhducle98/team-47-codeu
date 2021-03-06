<!--
Copyright 2019 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

<%@ page import="com.google.appengine.api.blobstore.BlobstoreService" %> <%@ page
import="com.google.appengine.api.blobstore.BlobstoreServiceFactory" %> <% BlobstoreService
blobstoreService = BlobstoreServiceFactory.getBlobstoreService(); String uploadUrl =
blobstoreService.createUploadUrl("/messages"); %>

<!DOCTYPE html>
<head>
  <title>User Page</title>
  <meta charset="UTF-8" />
  <link rel="stylesheet" href="/css/main.css" />
  <link rel="stylesheet" href="/css/map.css" />
  <link rel="stylesheet" href="/css/user-page.css" />
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.8.2/css/all.min.css"
  />
  <style>
    .username {
      padding-bottom: 0 !important;
    }
    .content {
      grid-template-columns: 1fr;
    }
  </style>
  <script src="/js/jquery-3.4.1.min.js"></script>
  <script src="/js/moment.js"></script>
  <script src="/js/user-page-loader.js"></script>
  <script src="/js/navigation-loader.js"></script>
  <script src="/js/map-loader.js"></script>
  <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB93QPT7R9sVl24lY6JWEr6oYBfWFm-ke4&libraries=places"
         async defer></script>
</head>
<body onload="fetchLoginStatus(); buildUI(); createMap(); createMarker()">
  <nav class="navbar">
    <div>
      <div class="navbar-item">
        <a href="/">
          <i class="fas fa-home"></i>
          Home
        </a>
      </div>
      <div class="navbar-item">
        <a href="/aboutus.html">
          <i class="fas fa-users"></i>
          About
        </a>
      </div>
      <div class="navbar-item">
        <a href="/stats.html">
          <i class="fas fa-chart-line"></i>
          Stats
        </a>
      </div>
      <div class="navbar-item">
        <a href="/search.html">
          <i class="fas fa-search"></i>
          Search
        </a>
      </div>
    </div>
    <div class="navbar__login"></div>
  </nav>
  <section class="content user-page">
    <div class="post hidden" id="map-block">
      <input id="pac-input" class="controls" type="text" placeholder="Search Box">
      <div id="map" class="post-content"></div>
    </div>
    <div class="public-feed">
      <div class="lb-text">
        <label id="lb-text" class="hidden">Please choose a location to create a post</label>
      </div>
      <div class="public-feed__header" style="display: block;">
        <h1 class="username"></h1>
        <div class="message-count">
          <h2></h2>
          <h2></h2>
        </div>
      </div>
      <form
        id="message-form"
        method="POST"
        enctype="multipart/form-data"
        action="<%= uploadUrl %>"
        class="post hidden"
      >
        <textarea name="text" id="message-input" placeholder="Write something"></textarea>
        <div class="thumbnail-preview"></div>
        <div class="actions">
          <label>
            <div class="file-uploader">
              <i class="far fa-images"></i>
              <div class="file-uploader__underlay"></div>
            </div>
            <input
              type="file"
              name="image"
              style="display: none;"
              onchange="handleUploadFile(event);"
            />
          </label>
          <button id="post-btn" class="post-btn" type="button" onclick="postMessage();">Post</button>
        </div>
      </form>
    </div>
  </section>
</body>
