function formatDateArray(timestampList) {
  const dateList = timestampList.map((timestamp) => {
    return moment(new Date(timestamp)).format("ddd, DD/MM");
  });
  const dateSet = [];
  for (let i = 6; i >= 0; --i) {
    const date = moment()
      .subtract(i, "days")
      .format("ddd, DD/MM");
    dateSet.push({
      date,
      count: dateList.filter((timestamp) => timestamp === date).length
    });
  }
  return dateSet;
}

function nth(d) {
  if (d > 3 && d < 21) return "th";
  switch (d % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

// Fetch stats and display them in the page.
async function fetchStats() {
  const statsContainer = document.getElementsByClassName("public-feed")[0];
  const stats = await fetch("http://localhost:8080/stats").then((response) =>
    response.json()
  );

  // Stats on ranking
  const table = stats.ranking
    .map(({ user, postCount }, idx) => {
      const mul = postCount > 1;
      return `<a href="${"/user-page.jsp?user=" + user}" class="ranking-row">
        <span class="ranking-row__ord">${idx + 1}${nth(idx + 1)}</span>
        <div class="ranking-row__info">
          <span class="ranking-row__user">${user}</span>
          <span class="ranking-row__post-count">${postCount} post${mul ? "s" : ""}</span>
        </div>
      </a>`;
    })
    .join("");
  statsContainer.innerHTML += `<div class="post stats">
    <div class="post-header">
      <h2 class="post-uploader">Top contributors</h2>
    </div>
    <div class="post-content">
      <div class="ranking">
        ${table}
      </div>
    </div>
  </div>`;

  // Stats on number of posts
  const mul = stats.messageCount > 1;
  statsContainer.innerHTML += `<div class="post stats">
    <div class="post-header">
      <h2 class="post-uploader">Message count</h2>
    </div>
    <div class="post-content">
      There ${mul ? "are" : "is"} ${stats.messageCount} message${mul ? "s" : ""} in total
      <div class="day-chart">
      </div>
    </div>
  </div>`;

  const drawChart = async () => {
    const bookData = new google.visualization.DataTable();
    bookData.addColumn("string", "Date");
    bookData.addColumn("number", "Number of messages");

    const dateArray = formatDateArray(stats.dayChart).map(({ date, count }) => [
      date,
      count
    ]);
    bookData.addRows(dateArray);

    const node = document.getElementsByClassName("day-chart")[0];
    new google.visualization.ColumnChart(node).draw(bookData, {
      width: 600,
      height: 300,
      title: "Post per day last week",
      backgroundColor: "transparent",
      legend: { position: "bottom", maxLines: 3 }
    });
  };

  google.charts.load("current", { packages: ["corechart"] });
  google.charts.setOnLoadCallback(drawChart);
}

// Fetch data and populate the UI of the page.
function buildUI() {
  fetchCommunity();
  fetchStats().catch(console.log);
}
