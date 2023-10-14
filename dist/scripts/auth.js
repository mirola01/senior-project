// Initialize Auth0 client as null
let auth0 = null;
// Initialize authentication status as false
let isAuthenticated = false;
var faunadb = window.faunadb;
export var q = faunadb.query;

// Configure the Auth0 client
export const configureClient = async () => {
    try {
        const response = await fetch('/.netlify/functions/auth_config');
        const config = await response.json();
        console.log('Auth0 Config:', config);
        console.log('Initializing Auth0 client with:', { domain: config.domain, client_id: config.client_id, audience: config.audience });
        auth0 = await createAuth0Client({
            domain: config.domain,
            client_id: config.client_id,
            audience: config.audience
        });
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
    try {
        console.log("First", auth0)
        isAuthenticated = await auth0.isAuthenticated();
        console.log("Auth?", isAuthenticated)
        if (isAuthenticated) {
            console.log("Auth", auth0)
            const yourAuth0Token = await auth0.getTokenSilently();
            const response = await fetch('/.netlify/functions/authenticate', {
                headers: {
                    Authorization: `Bearer ${yourAuth0Token}`
                }
            });
            const data = await response.json();
            console.log('API Response:', data.message);
        } else {
            console.log("Not auth, attempting to authenticate", auth0);
            console.log('Redirecting to:', 'https://lineup-manager.netlify.app/player-database.html');
            await auth0.loginWithRedirect({
                redirect_uri: 'https://lineup-manager.netlify.app/player-database.html'
            });
            
        }
    } catch (e) {
        console.error('Login failed:', e);
        console.log('Login details:', isAuthenticated, yourAuth0Token);
    }
};

// Handle user logout
export const logout = () => {
    auth0.logout({
        returnTo: 'https://lineup-manager.netlify.app'
    });
};