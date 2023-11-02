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

document.addEventListener('DOMContentLoaded', async function() {
    if (accessToken) {
        let token = await client.query(q.CurrentToken());
        token = token.value.id;

        let user_role = decodedJWT["https://db.fauna.com/roles"][0];

        if (user_role === "user" || user_role === undefined) {
            fetchFormations().then(formations => {
                displayFormations(formations);
            });
        } else {
            // Handle other roles if needed
        }
    }
});

async function fetchFormations() {
    // Your logic to fetch formations from FaunaDB based on the user's role
    // For this example, I'm assuming a function similar to players_by_owner
    let formations = await fetch("/.netlify/functions/formations_by_owner", {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            token,
            userId: decodedJWT["sub"]
        }),
    });
    return await formations.json();
}

function displayFormations(formations) {
    const formationsList = document.getElementById('formationsList');
    formations.forEach(formation => {
        const formationDiv = document.createElement('div');
        formationDiv.className = 'large-4 medium-4 cell formation-preview';
        formationDiv.innerHTML = `
            <div class="callout formation-callout" data-formation-id="${formation.ref.id}">
                <h3>${formation.data.name}</h3>
                <p>${formation.data.description}</p>
                <!-- Add more fields as needed -->
            </div>
        `;
        formationsList.appendChild(formationDiv);
    });

    // Add click event to each formation
    document.querySelectorAll('.formation-callout').forEach(item => {
        item.addEventListener('click', function() {
            const formationId = this.getAttribute('data-formation-id');
            showFormationDetails(formationId);
        });
    });
}

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
