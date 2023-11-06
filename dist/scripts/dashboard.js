import * as Auth from "./auth.js";
var faunadb = window.faunadb;
var q = faunadb.query;
var pass_formation = ""
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

document.addEventListener('DOMContentLoaded', async function () {
    if (accessToken) {
        let token = await client.query(q.CurrentToken());
        token = token.value.id;

        let user_role = decodedJWT["https://db.fauna.com/roles"][0];

        if (user_role === "user" || user_role === undefined) {
            fetchFormations(token).then(formations => { // Pass the token here
                displayFormations(formations);
            });
        } else {
            // Handle other roles if needed
        }
    }
});

async function fetchFormations(token) {
    let formations = await fetch("/.netlify/functions/formations_by_owner", {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            token, // Use the token here
            userId: decodedJWT["sub"]
        }),
    });
    return await formations.json();
}


function displayFormations(response) {
    const formations = response.data; // Access the "data" property of the response
    const formationsList = document.getElementById('formationsList');
    formations.forEach(formation => {
        const formationDiv = document.createElement('div');
        formationDiv.className = 'large-4 medium-4 cell formation-preview';

        // Create the formation link
        const formationLink = document.createElement('a');
        formationLink.href = `formation.html?id=${formation.ref['@ref'].id}`;
        formationLink.textContent = formation.data.name.trim();

        // Add a click event listener to the formation link
        formationLink.addEventListener('click', (event) => {
            // Save the player's position to a data attribute
            pass_formation = formation.ref['@ref'];
            console.log("pass-info" + pass_formation);
        });

        // Add the formation link to the formation div
        formationDiv.appendChild(formationLink);

        // Add more fields as needed

        formationsList.appendChild(formationDiv);
    });
}

// Add click event to each formation
document.querySelectorAll('.formation-callout').forEach(item => {
    item.addEventListener('click', function () {
        const formationId = this.getAttribute('data-formation-id');
        showFormationDetails(formationId);
    });
});


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