function buildList(userList) {
  const text = userList
    .map((user) => {
      return `
        <li>
          <a href="/user-page.jsp?user=${user}">${user}</a>
        </li>
      `;
    })
    .join("");
  document.getElementsByClassName("user-list")[0].innerHTML = text;
}

function fetchUserList() {
  fetch("/user-list")
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      throw res.statusText;
    })
    .then(buildList)
    .catch(alert);
}
