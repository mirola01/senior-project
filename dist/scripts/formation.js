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
    const wc_team = setupTeam(); // Setup the team interaction
    loadFormationFromFaunaDB(wc_team); // Load and render positions from FaunaDB

  // Set up event listeners for formation selection and button clicks
  setupFormationSelector(wc_team);
  document.querySelector('.save-lineup').addEventListener('click', () => saveLineup(wc_team));
  document.querySelector('.clear-lineup').addEventListener('click', () => clearLineup(wc_team));
});
async function loadFormationFromFaunaDB(wc_team) {
    const params = new URLSearchParams(window.location.search);
    const formationId = params.get('id');
    console.log("formationId", formationId)
    if (formationId) {
      try {
        let token = await client.query(q.CurrentToken());
        token = token.value.id;
        fetchFormation(token, formationId).then(formations => {  // Pass the token here
          displayFormations(formations);
        });
        //wc_team.updateFormation(response.data); // Update the team formation with the data
        renderPositions(wc_team); // Then render the positions
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
            token,  // Use the token here
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
  }
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

function setupTeam() {
  const wc_team = {}; // Initialize wc_team if it doesn't exist

  // Define all methods and properties for wc_team here.
  wc_team.updateFormation = function (formation) {
    // ... (updateFormation function code here)
  };

  wc_team.dragDrap = {
    // ... (dragDrap module code here)
  };

  wc_team.makePlayersDraggable = function () {
    // ... (makePlayersDraggable function code here)
  };

  return wc_team;
}

async function renderPositions(wc_team) {
  // ... (renderPositions function code here, include wc_team.dragDrap.init(); at the end)
}

async function saveLineup(wc_team) {
  // ... (saveLineup function code here)
}

async function clearLineup(wc_team) {
  // ... (clearLineup function code here)
}

// Helper functions like generateDefaultImage can be defined below.
function generateDefaultImage(jerseyNumber) {
  // ... (generateDefaultImage function code here)
}
