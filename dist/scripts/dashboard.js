document.addEventListener('DOMContentLoaded', function() {
    fetchFormations().then(formations => {
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
    });
});

function showFormationDetails(formationId) {
    // Fetch formation details from FaunaDB based on the formationId
    client.query(q.Get(q.Ref(q.Collection('formations'), formationId)))
        .then(formation => {
            const modal = document.getElementById('formationModal');
            document.getElementById('formationName').innerText = formation.data.name;
            // Populate formationDetails with the formation data
            // For this example, I'm just showing the description
            document.getElementById('formationDetails').innerText = formation.data.description;
            
            // Open the modal
            var elem = new Foundation.Reveal($('#formationModal'));
            elem.open();
        })
        .catch(error => console.error('Error fetching formation details:', error.message));
}
