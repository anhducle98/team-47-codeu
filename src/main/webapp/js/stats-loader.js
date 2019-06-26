// Fetch stats and display them in the page.
function fetchStats() {
  const url = "/stats";
  fetch(url)
    .then((response) => response.json())
    .then((stats) => {
      const statsContainer = document.getElementsByClassName("public-feed")[0];
      const mul = stats.messageCount > 1;
      const msg = `There ${mul ? "are" : "is"} ${stats.messageCount} message${
        mul ? "s" : ""
      } in total`;
      statsContainer.innerHTML += `<div class="post">
        <div class="post-header">
          <h2 class="post-uploader">Message count</h2>
        </div>
        <div class="post-content">
          ${msg}
        </div>
      </div>`;
    });
}

// Fetch data and populate the UI of the page.
function buildUI() {
  fetchCommunity();
  fetchStats();
}
