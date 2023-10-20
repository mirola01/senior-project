// Initialize Auth0 client as null
let auth0 = null;
// Initialize authentication status as false
let isAuthenticated = false;
var faunadb = window.faunadb;
export var q = faunadb.query;
const fetchAuthConfig = () => fetch('/.netlify/functions/auth_config');

// Configure the Auth0 client
export const configureClient = async () => {
    let config;
    try {
        const response = await fetchAuthConfig();
        config = await response.json();
        console.log('Auth0 Config:', config);
        auth0 = await createAuth0Client({ 
            domain: config.domain,
            client_id: config.client_id,
            audience: config.audience
            
        });
        const token = await auth0.getTokenSilently();
        console.log(token)
        isAuthenticated = await auth0.isAuthenticated();
        console.log(isAuthenticated)
    } catch (e) {
        console.error('Auth0 client initialization failed:', e);
        if (config) { console.log('Auth0 config:', config); }
    }
};

export const getAuth0 = () => {
    return auth0;
};

// Handle user login
export const login = async () => {
    await auth0.loginWithRedirect({
        redirect_uri: 'https://lineup-manager.netlify.app/player-database.html'
    });
    const query = window.location.search;
  if (query.includes("code=") && query.includes("state=")) {

    // Process the login state
    await auth0.handleRedirectCallback();
    
    console.log("Authentificated")

    // Use replaceState to redirect the user away and remove the querystring parameters
    window.history.replaceState({}, document.title, "/player-database.html");}
};

// Handle user logout
export const logout = () => {
    auth0.logout({
        returnTo: 'https://lineup-manager.netlify.app'
    });
};
