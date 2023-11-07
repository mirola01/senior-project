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
  loadFormationFromFaunaDB(); 
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

function displayFormations(formationData) {
  console.log("formationData", formationData)
  const formationTitle = formationData.data.name;
  const formationName = formationData.data.formation;
  const players = formationData.data.players;
  console.log("formationName", formationName)
  const formationSelector = document.getElementById('formationSelector');

  // Find the option with the matching value
  const matchingOption = formationSelector.querySelector(`option[value="${formationName}"]`);
  if (matchingOption) {
    updateFormation(selectedFormation); 
    matchingOption.selected = true;
    document.getElementById('starting_11').className = formationName;
    renderPositions(); // Call renderPositions here with the actual formation data
  }

  
}


function renderPositions(formationData) {
  console.log("object", formationData)
  const positions = formationData;
  

  // Iterate over each position in the formation
  for (const position in positions) {
    console.log("position", position);
    const playerList = positions[position]; // e.g., ['ter Stegen', 'NO_PLAYER', ...]

    // Iterate over each player in the position list
    playerList.forEach((playerName, index) => {
      if (playerName !== 'NO_PLAYER') {
        console.log("playerName", playerName)
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
function updateFormation(formation) {
  const defenders = document.querySelector('.df');
  const midfielders = document.querySelector('.md');
  const forwards = document.querySelector('.fw');

  while (defenders.firstChild) {
    defenders.removeChild(defenders.firstChild);
  }
  while (midfielders.firstChild) {
    midfielders.removeChild(midfielders.firstChild);
  }
  while (forwards.firstChild) {
    forwards.removeChild(forwards.firstChild);
  }

  let defCount, midCount, fwdCount;
  const formationNumbers = formation.split('-').slice(1).map(Number); // "4-4-2" becomes [4, 4, 2]

  [defCount, midCount, fwdCount] = formationNumbers;

  for (let i = 0; i < defCount; i++) {
    const li = document.createElement('li');
    li.id = `pos${i+2}`;
    li.draggable = true;
    defenders.appendChild(li);
  }

  for (let i = 0; i < midCount; i++) {
    const li = document.createElement('li');
    li.id = `pos${i+2+defCount}`;
    li.draggable = true;
    midfielders.appendChild(li);
  }

  for (let i = 0; i < fwdCount; i++) {
    const li = document.createElement('li');
    li.id = `pos${i+2+defCount+midCount}`;
    li.draggable = true;
    forwards.appendChild(li);
  }
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