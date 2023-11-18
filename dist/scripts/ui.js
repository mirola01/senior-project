/**
 * @file Manages the user interface updates of the soccer team management application. 
 * It checks the user's authentication status and role to conditionally render UI elements 
 * and player information. It also includes a utility function to generate default player images.
 */
import * as Auth from "./auth.js";
import { delete_player } from './database.js';

var faunadb = window.faunadb;
var q = faunadb.query;

/**
 * Updates the user interface based on the user's authentication status and role.
 * If authenticated, it fetches the player data and populates the UI accordingly.
 * It also conditionally displays UI elements like the 'Add New' button based on the user role.
 */
window.onload = updateUI;

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
      const playersContainer = document.querySelector('.players');
      // Clear existing content in the container
      playersContainer.innerHTML = '';
      players["data"].forEach(player => {
        const playerCard = document.createElement("div");
        playerCard.className = "player card";
        playerCard.innerHTML = `
          <div class="pic">
            <img src="${player.data.image || generateDefaultImage(player.data.jersey)}" alt="Player Image">
          </div>
          <div class="info">
            <div class="name">${player.data.name}</div>
            <div class="position">${player.data.position}</div>
            <div class="logo"><img src="images/logo-icon.png" alt="Logo Image"></div> 
          </div>
          
          <div class="extra">
            <div class="delete">
              <i class="fas fa-trash" onclick="deletePlayer('${player.data.id}')"></i>
            </div>
            <div class="jersey">
              <div class="number">#${player.data.jersey}</div>
            </div>
          </div>

        `;
        playersContainer.appendChild(playerCard);
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
    console.log("No access token found.");
    window.location.href = 'https://lineup-manager.netlify.app/';
    return; 
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

function deletePlayer(playerId) {
  console.log("1")
  if (confirm('Are you sure you want to delete this player?')) {
      delete_player(playerId); // Assuming delete_player is your function to handle deletion
  }
}

