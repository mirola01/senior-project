/**
 * @file Manages the user interface updates of the soccer team management application. 
 * It checks the user's authentication status and role to conditionally render UI elements 
 * and player information. It also includes a utility function to generate default player images.
 */
import * as Auth from "./auth.js";

var faunadb = window.faunadb;
var q = faunadb.query;

/**
 * Updates the user interface based on the user's authentication status and role.
 * If authenticated, it fetches the player data and populates the UI accordingly.
 * It also conditionally displays UI elements like the 'Add New' button based on the user role.
 */
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
      console.log("Players find image link", players)
      const tableBody = document.getElementById("player-tbody");
      tableBody.innerHTML = "";
      var htmlText = players["data"].map(function (o) {
        console.log("Current object:", o);  
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "delete-checkbox";
        const id = o["ref"] && o["ref"]["@ref"] ? o["ref"]["@ref"].id : "undefined";
        const jerseyNumber = o.data.jersey;
        const playerImage = o.data.image || generateDefaultImage(jerseyNumber);

        const label = document.createElement("label");
        label.htmlFor = o.ref.id;
        label.textContent = "Checkbox Label";

        return `
      <tr class="table-expand-row-content">
          <td><img src="${playerImage}" alt="Player Image" class="playerImage"></td> 
          <td>${o.data.name}</td>
          <td>${o.data.age}</td>
          <td>${o.data.position}</td>
          <td>${jerseyNumber} <span class="expand-icon"></span></td>
          <td><input type="checkbox" class="delete-checkbox" data-id="${id}"></td>
      </tr>`;
      });
      tableBody.innerHTML = htmlText.join("");

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

/**
 * Generates a default image for players using a canvas element.
 * The jersey number is rendered onto a gray square background.
 * 
 * @param {number} jerseyNumber - The jersey number to be displayed on the default image.
 * @returns {string} A data URL representing the generated image.
 */
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