// Presuming this is the entire script for the formation.html
import * as Auth from "./auth.js";
var faunadb = window.faunadb;
var q = faunadb.query;
var jwt_decode = window.jwt_decode; // Make sure jwt_decode is available in the global scope.

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
  
    if (formationId) {
      try {
        const response = await client.query(
          q.Get(q.Ref(q.Collection('formations'), formationId))
        );
        wc_team.updateFormation(response.data); // Update the team formation with the data
        renderPositions(wc_team); // Then render the positions
      } catch (error) {
        console.error('Error fetching formation:', error);
      }
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
