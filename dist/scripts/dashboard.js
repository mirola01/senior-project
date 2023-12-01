/**
 * @file Handles the user dashboard operations in the soccer team management application.
 * It fetches and displays formations specific to the authenticated user and 
 * allows users to view details of each formation.
 */

import * as Auth from "./auth.js";
var faunadb = window.faunadb;
var q = faunadb.query;

const fauna_key = Auth.getFaunaKey();
const client = new faunadb.Client({
  secret: fauna_key,
  domain: "db.us.fauna.com",
  port: 443,
  scheme: "https",
});

/**
 * DOMContentLoaded event listener to fetch and display formations
 * based on the authenticated user's role after the DOM is fully loaded.
 */

export async function initializeDashboard() {
    console.log("1")
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
    try {
        const decodedJWT = jwt_decode(accessToken);
        let token = await client.query(q.CurrentToken());
        token = token.value.id;

        let user_role = decodedJWT["https://db.fauna.com/roles"][0];

        if (user_role === "user" || user_role === undefined) {
            fetchFormations(token, decodedJWT).then(formations => {  // Pass the token here
                displayFormations(formations);
            });
    }} catch (error) {
        console.error("Error decoding token:", error);
        // Handle decoding errors (e.g., malformed token)
    }
    } else {
    console.log("No access token found.");
    window.location.href = 'https://lineup-manager.netlify.app/';
    return; 
    }
}

/**
 * Fetches formations from FaunaDB based on the owner's token.
 * 
 * @param {string} token - The FaunaDB access token for the current user.
 * @returns {Promise<Object>} A promise that resolves with the formations data.
 */
async function fetchFormations(token, decodedJWT) {  
    let formations = await fetch("/.netlify/functions/formations_by_owner", {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            token,  // Use the token here
            userId: decodedJWT["sub"]
        }),
    });
    return await formations.json();
}

/**
 * Renders the fetched formations as HTML elements in the DOM.
 * 
 * @param {Object} response - The response object containing formations data.
 */
function displayFormations(response) {
    const formations = response.data;
    const formationsList = document.getElementById('formationsList');
    formationsList.innerHTML = '';
  
    formations.forEach(formation => {
      const formationDiv = document.createElement('div');
      formationDiv.className = 'large-4 medium-4 cell formation-preview';
      formationDiv.innerHTML = `
        <div class="callout formation-callout" data-formation-id="${formation.ref['@ref'].id}">
            <a href="formation.html?id=${formation.ref['@ref'].id}"><h3>${formation.data.name.trim()}</h3></a>
            <p>${formation.data.formation}</p>
            <span class="delete-formation-icon" onclick="deleteFormation('${formation.ref['@ref'].id}')">X</span>
        </div>
      `;
  
      formationsList.appendChild(formationDiv);
    });
  }
  

    // Add click event to each formation
    document.querySelectorAll('.formation-callout').forEach(item => {
        item.addEventListener('click', function() {
            const formationId = this.getAttribute('data-formation-id');
            showFormationDetails(formationId);
        });
    });
}

/**
 * Fetches and displays the details of a specific formation when a formation preview is clicked.
 * 
 * @param {string} formationId - The unique identifier for the formation.
 */
function showFormationDetails(formationId) {
    // Fetch formation details from FaunaDB based on the formationId
    client.query(q.Get(q.Ref(q.Collection('formations'), formationId)))
        .then(formation => {
            const modal = document.getElementById('formationModal');
            document.getElementById('formationName').innerText = formation.data.name;
            document.getElementById('formationDetails').innerText = formation.data.description;
            
            // Open the modal
            var elem = new Foundation.Reveal($('#formationModal'));
            elem.open();
        })
        .catch(error => console.error('Error fetching formation details:', error.message));
}

document.querySelectorAll('.delete-formation-icon').forEach(item => {
    item.addEventListener('click', function() {
      const formationId = this.closest('.formation-callout').getAttribute('data-formation-id');
      deleteFormation(formationId); // Function to be implemented
    });
  });
  