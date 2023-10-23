import * as Auth from "./auth.js";

var faunadb = window.faunadb;
var q = faunadb.query;

export async function updateUI() {
    const auth0 = Auth.getAuth0();
    const isAuthenticated = await auth0.isAuthenticated();
    if (isAuthenticated) {
        const accessToken = await auth0.getTokenSilently();
        /**
         * Fetch players
         */
        const fauna_key = Auth.getFaunaKey();
        var client = new faunadb.Client({
            secret: fauna_key,
            domain: 'db.us.fauna.com',
            port: 443,
            scheme: 'https'
          });
        
        //document.querySelector(".card-container").style.display = 'grid';
        /**
         * Check the role
         */
        // console.log("current token", q.CurrentToken())
        let token = await client.query(
             q.CurrentToken()
         );
        
        console.log("token", token);
        let user_role = token["https:/db.fauna.com/roles"];
        console.log("user_role",user_role);

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
                /**
                 * Create a checkbox input element
                 */
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.className = "delete-checkbox"; // Add a class for identification
                checkbox.setAttribute("data-id", o.ref.id); // Set the data-id attribute

                /**
                 * Create a label element for the checkbox
                 */
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

export function setupTabs() {
    $('.tactical-guide').find('input, textarea').on('keyup blur focus', function (e) {

        var $this = $(this),
            label = $this.prev('label');

        if (e.type === 'keyup') {
            if ($this.val() === '') {
                label.removeClass('active-tac highlight');
            } else {
                label.addClass('active-tac highlight');
            }
        } else if (e.type === 'blur') {
            if ($this.val() === '') {
                label.removeClass('active-tac highlight');
            } else {
                label.removeClass('highlight');
            }
        } else if (e.type === 'focus') {

            if ($this.val() === '') {
                label.removeClass('highlight');
            } else if ($this.val() !== '') {
                label.addClass('highlight');
            }
        }

    });

    $('.tab a').on('click', function (e) {

        e.preventDefault();

        $(this).parent().addClass('active-tac');
        $(this).parent().siblings().removeClass('active-tac');

        target = $(this).attr('href');

        $('.tab-content > div').not(target).hide();

        $(target).fadeIn(600);

    });
}

