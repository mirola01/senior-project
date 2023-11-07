// Presuming this is the entire script for the formation.html
import * as Auth from "./auth.js";
var faunadb = window.faunadb;
var q = faunadb.query;
// Initialize variables
const accessToken = localStorage.getItem("accessToken");
const decodedJWT = jwt_decode(accessToken);
const fauna_key = Auth.getFaunaKey();
const client = new faunadb.Client({
  secret: fauna_key,
  domain: "db.us.fauna.com",
  port: 443,
  scheme: "https",
});

document.addEventListener("DOMContentLoaded", function () {
  loadFormationFromFaunaDB(); // Load and render positions from FaunaDB

  // Set up event listeners for formation selection and button clicks
  setupFormationSelector(wc_team);
  document.querySelector('.save-lineup').addEventListener('click', () => saveLineup(wc_team));
  document.querySelector('.clear-lineup').addEventListener('click', () => clearLineup(wc_team));
});
async function loadFormationFromFaunaDB() {
  const params = new URLSearchParams(window.location.search);
  const formationId = params.get('id');
  console.log("formationId", formationId)
  if (formationId) {
    try {
      let token = await client.query(q.CurrentToken());
      token = token.value.id;
      fetchFormation(token, formationId).then(formations => { // Pass the token here
        displayFormations(formations);
      });
      //wc_team.updateFormation(response.data); // Update the team formation with the data
      renderPositions(); // Then render the positions
    } catch (error) {
      console.error('Error fetching formation:', error);
    }
  }
}
async function fetchFormation(token, formationId) {
  let formations = await fetch("/.netlify/functions/formation_by_id", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      token, // Use the token here
      formationId: formationId
    }),
  });
  return await formations.json();
}

function displayFormations(response) {
  const formationSelector = document.getElementById('formationSelector');
  const formationData = response.data.formation; // Get the formation from the data

  // Find the option with the matching value
  const matchingOption = formationSelector.querySelector(`option[value="${formationData}"]`);

  // If the matching option exists, select it
  if (matchingOption) {
    matchingOption.selected = true;
    document.getElementById('starting_11').className = formationData;
    // Iterate through each position (gk, df, md, fw) and player
    for (const position in formationData.players) {
      const playersList = formationData.players[position];
      const positionContainer = document.querySelector(`.${position}-container`);

      playersList.forEach(playerName => {
        // Create player element only if the player's name is not "NO_PLAYER"
        if (playerName !== "NO_PLAYER") {
          const playerElement = document.createElement('div');
          playerElement.textContent = playerName;
          playerElement.classList.add('player', position);
          // Append to the respective position container on the field
          positionContainer.appendChild(playerElement);
        }
      });
  }
  }
}

function renderPositions(formationData, wc_team) {
  const positions = formationData.players;

  // Clear current positions
  clearField();

  // Iterate over each position in the formation
  for (const position in positions) {
    const playerList = positions[position]; // e.g., ['ter Stegen', 'NO_PLAYER', ...]

    // Iterate over each player in the position list
    playerList.forEach((playerName, index) => {
      if (playerName !== 'NO_PLAYER') {
        const playerElement = document.createElement('div');
        playerElement.textContent = playerName; // Here you would add your player's image and styling
        playerElement.classList.add('player', position);
        playerElement.setAttribute('data-index', index);

        // Append to the respective position container on the field
        document.querySelector(`.${position}-container`).appendChild(playerElement);
      }
    });
  }

  // After rendering the positions, initialize any drag-and-drop functionality
  wc_team.makePlayersDraggable();
  wc_team.dragDrap.init();
}

function clearField() {
  // Remove existing players from the field
  document.querySelectorAll('.player').forEach(player => player.remove());
}



function setupFormationSelector(wc_team) {
  document.getElementById('formationSelector').addEventListener('change', function () {
    const selectedFormation = this.value;
    document.getElementById('starting_11').className = selectedFormation;
    wc_team.updateFormation(selectedFormation);
    wc_team.makePlayersDraggable();
    wc_team.dragDrap.init();
  });
}