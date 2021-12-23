// Fauna client
var faunadb = window.faunadb;
var q = faunadb.query;

let auth0 = null;
const note_container = document.querySelector('.card-container');

const fetchAuthConfig = () => fetch("<YOUR_HEROKU_URL>/auth_config.json");

// Auth0 Client
const configureClient = async () => {
    const response = await fetchAuthConfig();
    const config = await response.json();

    auth0 = await createAuth0Client({
        domain: config.domain,
        client_id: config.clientId,
        audience: config.aud
    });
};

const updateUI = async () => {
    const isAuthenticated = await auth0.isAuthenticated();
    console.log(isAuthenticated);

    
    if (isAuthenticated) {
        document.querySelector('.please-login').style.display = 'none';
        const accessToken = await auth0.getTokenSilently();
        console.log(accessToken);

        // fetch notes
        var client = new faunadb.Client({
            secret: accessToken,
            domain: 'db.us.fauna.com',
            port: 443,
            scheme: 'https'
        })

        document.getElementById("auth-btn").innerHTML = "Logout"
        document.getElementById("auth-btn").style.display = 'block';
        document.querySelector(".card-container").style.display = 'grid';

        // check the role
        let token = await client.query(
            q.CurrentToken()
        )
        let user_role = token["https:/db.fauna.com/roles"][0]
        console.log(user_role)

        if (user_role === 'user')
        {
            document.querySelector('#add-new-btn').style.display = 'block';

            let notes = await client.query(
                q.Map(
                    q.Paginate(
                        q.Match(q.Index('notes_by_owner'), q.CurrentIdentity())
                    ),
                    q.Lambda(
                        "X", q.Get(q.Var("X"))
                    )
                )
                
            );
            notes_section = document.querySelector('.card-container');
            const addCard = notes_section.lastElementChild
            notes_section.lastElementChild.remove()
            var htmlText = notes['data'].map(function(o){
                return `
                    <div class="card">
                        <span class="tag tag-purple">${o.data.title}</span>
                        <p>${String(o.data.body).slice(0,40)}...</p>
                   </div>`
              });

            notes_section.innerHTML += htmlText.join('');
            notes_section.appendChild(addCard)
            document.querySelector('.please-login').style.display = 'none';

        } else {
            document.querySelector('#add-new-btn').style.display = 'none';
            document.querySelector('#new-card-btn').style.display = 'none';
            document.querySelector('#search-bar').style.display = 'none';
            document.querySelector('.admin-msg').style.display = 'block';
            notes_section = document.querySelector('.card-container');
            let notes = await client.query(
                q.Map(
                    q.Paginate(
                        q.Match(q.Index('allNotes'))
                    ),
                    q.Lambda(
                        "X", q.Get(q.Var("X"))
                    )
                )
                
            );
            
            notes_section.style.display = 'grid';
            var htmlText = notes['data'].map(function(o){
                return `
                    <div class="card">
                        <span class="tag tag-purple">${o.data.title}</span>
                        <p id="note-body">${String(o.data.body).slice(0,40)}...</p>
                        <p id="note-meta">
                   </div>`
              });
            notes_section.innerHTML = htmlText.join('');
            // document.querySelector('.please-login').style.display = 'None';
        }

    } else {
        document.getElementById("auth-btn").innerHTML = "Login"
        document.getElementById("auth-btn").style.display = 'block';
        document.getElementById("auth-btn").innerHTML = "Login"
    }
};

const login = async () => {
    await auth0.loginWithRedirect({
      redirect_uri: window.location.origin
    });
};

const logout = () => {
  auth0.logout({
    returnTo: window.location.origin
  });
};

document.getElementById("auth-btn").addEventListener('click', ()=> {
    if (document.getElementById("auth-btn").innerHTML== "Login") {
        login();
    } else {
        logout();
    }
})

window.onload = async () => {
    await configureClient();
    updateUI();
    
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
  
        // Process the login state
        await auth0.handleRedirectCallback();
        
        updateUI();
    
        // Use replaceState to redirect the user away and remove the querystring parameters
        window.history.replaceState({}, document.title, "/");
    }
};

const btn = document.querySelector('#add-note');

const new_note = async ()=> {
    const isAuthenticated = await auth0.isAuthenticated();
    const accessToken = await auth0.getTokenSilently();
    console.log(accessToken);
    console.log("the token is "+accessToken)
    if (isAuthenticated) {
        var client = new faunadb.Client({
            secret: String(accessToken),
            domain: 'db.us.fauna.com',
            port: 443,
            scheme: 'https'
        })

        let data = await client.query(
            q.Create(q.Collection("Notes"), {
                data: {
                    title: document.querySelector('#title').value,
                    body: document.querySelector('#descr').value,
                    owner: q.CurrentIdentity()
                }
            })
        ).then((ret) => console.log(ret))
        .catch((err) => console.error('Error: %s', err))
        
        console.log(data);
        // note_container.appendChild(add_new_card);
        body_.classList.remove('container-fade');
        form.style.display = 'none';
        window.location.reload();
    }
};

btn.addEventListener('click', new_note);
