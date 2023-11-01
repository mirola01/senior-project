import * as Auth from "./auth.js";

var faunadb = window.faunadb;
var q = faunadb.query;

export async function updateUI() {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    const decodedJWT = jwt_decode(accessToken);
    /**
     * Fetch players
     */
    const fauna_key = Auth.getFaunaKey();
    var client = new faunadb.Client({
      secret: fauna_key,
      domain: "db.us.fauna.com",
      port: 443,
      scheme: "https",
    });
    /**
     * Check the role
     */
    let token = await client.query(q.CurrentToken());
    token = token.value.id;

    console.log("token", token);
    let user_role = decodedJWT["https://db.fauna.com/roles"][0];
    console.log("user_role", user_role);

    if (user_role === "user" || user_role === undefined) {
      document.querySelector("#add-new-btn").style.display = "block";

      let players = await fetch("/.netlify/functions/players_by_owner", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          token,
          userId: decodedJWT["sub"]
        }),
      });
      console.log("token+userId", token, decodedJWT["sub"])
      players = await players.json();

      const tableBody = document.getElementById("player-tbody");
      tableBody.innerHTML = "";

      players["data"].forEach(function (o) {
        const row = document.createElement('tr');
        row.className = "table-expand-row-content";

        // Create and populate the image cell
        const imgCell = document.createElement('td');
        const img = document.createElement('img');
        img.src = o.imageData; // Assuming o.imageData contains the base64 image string
        img.className = "playerImage";
        img.alt = "Player Image";
        imgCell.appendChild(img);
        row.appendChild(imgCell);

        // Create and populate the name cell
        const nameCell = document.createElement('td');
        nameCell.textContent = o.name; // Assuming o.name contains the name
        row.appendChild(nameCell);

        // Create and populate the age cell
        const ageCell = document.createElement('td');
        ageCell.textContent = o.age; // Assuming o.age contains the age
        row.appendChild(ageCell);

        // Create and populate the position cell
        const positionCell = document.createElement('td');
        positionCell.textContent = o.position; // Assuming o.position contains the position
        row.appendChild(positionCell);

        // Create and populate the number cell
        const numberCell = document.createElement('td');
        numberCell.innerHTML = `${o.number} <span class="expand-icon"></span>`; // Assuming o.number contains the number
        row.appendChild(numberCell);

        // Create and populate the checkbox cell
        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'delete-checkbox';
        if (o.ref && o.ref.id) { // Only set it if it exists
          checkbox.setAttribute("data-id", o.ref.id);
        }
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);

        // Append the row to the table body
        tableBody.appendChild(row);
      });

    } else {
      document.querySelector("#add-new-btn").style.display = "none";
      document.querySelector("#search-bar").style.display = "none";
      let players = await fetch("/.netlify/functions/allPlayers", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          token
        }),
      });
      players = await players.json();

      const tableBody = document.querySelector("#player-table");
      var htmlText = players["data"].map(function (o) {
        return `
                    <tr>
                    <td>${o.data.name}</td>
                    <td>${o.data.age}</td>
                    <td>${o.data.position}</td>
                    </tr>`;
      });
      tableBody.innerHTML = htmlText.join("");

    }
  } else {
    console.log("not auth");
  }
}

function generateDefaultImage(jerseyNumber) {
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;

  const ctx = canvas.getContext('2d');

  // Draw background
  ctx.fillStyle = 'gray';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw text
  ctx.fillStyle = 'white';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  console.log("Jersey", jerseyNumber)
  ctx.fillText(jerseyNumber, canvas.width / 2, canvas.height / 2);

  // Convert to data URL
  const dataURL = canvas.toDataURL('image/png');

  return dataURL;
}