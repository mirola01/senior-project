// Fauna client
var faunadb = window.faunadb;
var q = faunadb.query;

let auth0 = null;

const fetchAuthConfig = () => fetch("/auth_config.json");

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
        document.querySelector("#add-new-btn").style.display = 'block';
        document.querySelector('.please-login').style.display = 'none';

        // check the role
        let token = await client.query(
            q.CurrentToken()
        )
        let user_role = token["https:/db.fauna.com/roles"][0]
        console.log(user_role)

        if (user_role === 'user')
        {

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
            var htmlText = notes['data'].map(function(o){
                return `
                    <div class="card">
                        <span class="tag tag-purple">${o.data.title}</span>
                        <p>${o.data.body}</p>
                   </div>`
              });
            notes_section.innerHTML += htmlText.join('');
        } else {
            document.querySelector('.please-login').style.display = 'block';
            document.querySelector('.please-login').innerHTML = 'Welcome Admin!';
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
            console.log(notes);
            notes_section = document.querySelector('.card-container');
            notes_section.style.display = 'grid';
            var htmlText = notes['data'].map(function(o){
                return `
                    <div class="card">
                        <span class="tag tag-purple">${o.data.title}</span>
                        <p>${o.data.body}</p>
                   </div>`
              });
            notes_section.innerHTML += htmlText.join('');
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
        body_.classList.remove('container-fade');
        form.style.display = 'none';
        window.location.reload();
    }
};

btn.addEventListener('click', new_note);