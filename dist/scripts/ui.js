import {
    q
} from './auth.js';

export async function updateUI(auth0) {
    console.log('auth0 object before isAuthenticated call:', auth0);

    const isAuthenticated = await auth0.isAuthenticated();
    if (isAuthenticated) {
        const accessToken = await auth0.getTokenSilently();
        console.log(accessToken);

        // fetch players
        var client = new faunadb.Client({
            secret: accessToken,
            domain: 'db.us.fauna.com',
            port: 443,
            scheme: 'https'
        });
        //document.querySelector(".card-container").style.display = 'grid';
        // check the role
        let token = await client.query(
            q.CurrentToken()
        );
        let user_role = token["https:/db.fauna.com/roles"][0];
        console.log(user_role);

        if (user_role === 'user') {
            document.querySelector('#add-new-btn').style.display = 'block';

            let players = await client.query(
                q.Map(
                    q.Paginate(
                        q.Match(q.Index('players_by_owner'), q.CurrentIdentity())
                    ),
                    q.Lambda(
                        "X", q.Get(q.Var("X"))
                    )
                )

            );
            //players_section = document.querySelector('.card-container');
            //const addCard = players_section.lastElementChild
            //players_section.lastElementChild.remove()
            const tableBody = document.getElementById('player-tbody');
            var htmlText = players['data'].map(function (o) {
                // Create a checkbox input element
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.className = "delete-checkbox"; // Add a class for identification
                checkbox.setAttribute("data-id", o.ref.id); // Set the data-id attribute

                // Create a label element for the checkbox
                const label = document.createElement("label");
                label.htmlFor = o.ref.id; // Match the 'for' attribute to the checkbox's ID
                label.textContent = "Checkbox Label"; // You can customize the label text
                return `
        <tr>
            <td>${o.data.name}</td>
            <td>${o.data.age}</td>
            <td>${o.data.position}</td>
            <td>${checkbox.outerHTML}</td>
        </tr>`;
            });
            console.log('tableBody:', tableBody);
            tableBody.innerHTML = htmlText.join('');

            //players_section.innerHTML += htmlText.join('');
            //players_section.appendChild(addCard)
            //document.querySelector('.please-login').style.display = 'none';
        } else {
            document.querySelector('#add-new-btn').style.display = 'none';
            document.querySelector('#new-card-btn').style.display = 'none';
            document.querySelector('#search-bar').style.display = 'none';
            document.querySelector('.admin-msg').style.display = 'block';
            //players_section = document.querySelector('.card-container');
            let players = await client.query(
                q.Map(
                    q.Paginate(
                        q.Match(q.Index('allPlayers'))
                    ),
                    q.Lambda(
                        "X", q.Get(q.Var("X"))
                    )
                )

            );

            //players_section.style.display = 'grid';
            const tableBody = document.querySelector('#player-table tbody');
            var htmlText = players['data'].map(function (o) {
                return `
                    <tr>
                    <td>${o.data.name}</td>
                    <td>${o.data.age}</td>
                    <td>${o.data.position}</td>
                    </tr>`;
            });
            tableBody.innerHTML = htmlText.join('');

            // document.querySelector('.please-login').style.display = 'None';
        }

    } else {
        console.log("not auth")
    }
}