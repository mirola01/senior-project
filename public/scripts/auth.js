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
        document.getElementById("auth-btn").innerHTML = "Logout"
        document.getElementById("auth-btn").style.display = 'block';
        document.querySelector(".card-container").style.display = 'grid';
        document.querySelector("#add-new-btn").style.display = 'block';
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
                    <span class="tag tag-purple"> Title: ${o.data.title}</span>
                    <p> Username: ${o.data.body}</p>
               </div>`
          });
        notes_section.innerHTML += htmlText.join('');
        
    } else {
        document.getElementById("auth-btn").innerHTML = "Login"
        document.getElementById("auth-btn").style.display = 'block';
        document.getElementById("auth-btn").innerHTML = "Login"
    }
};

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

document.getElementById("auth-btn").addEventListener('click', ()=> {
    if (document.getElementById("auth-btn").innerHTML== "Login") {
        login();
    } else {
        logout();
    }
})

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

const btn = document.querySelector('#add-note');

const new_note = async ()=> {
    const isAuthenticated = await auth0.isAuthenticated();
    const accessToken = await auth0.getTokenSilently();
    console.log(accessToken);
    console.log("the token is "+accessToken)
    if (isAuthenticated) {
        function account (res) {
            if (!res || !res.responseHeaders) return
            h = res.responseHeaders
            console.log(h)
        }

        var client = new faunadb.Client({
            secret: String(accessToken),
            domain: 'db.us.fauna.com',
            observer: account,
            port: 443,
            scheme: 'https'
        })

        let data = client.query(
            q.Create(q.Collection("Notes"), {
                data: {
                    title: document.querySelector('#title').value,
                    body: document.querySelector('#descr').value,
                    owner: q.CurrentIdentity()
                }
            })
        ).then((ret) => console.log(ret))
        .catch((err) => console.error('Error: %s', err))

        // let data = client.query(
        //     q.Get(
        //       q.Ref(q.Collection('Notes'), '1')
        //     )
        // )
        
        console.log(data)
    }
};

btn.addEventListener('click', new_note);