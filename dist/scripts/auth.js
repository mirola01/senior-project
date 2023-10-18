// Initialize Auth0 client as null
let auth0 = null;
// Initialize authentication status as false
let isAuthenticated = false;
var faunadb = window.faunadb;
export var q = faunadb.query;

// Configure the Auth0 client
export const configureClient = async () => {
    let config;
    try {
        const response = await fetch('/.netlify/functions/auth_config');
        config = await response.json();
        console.log('Auth0 Config:', config);
        auth0 = await createAuth0Client({
            domain: config.domain,
            client_id: config.client_id,
            audience: config.audience
        });
        console.log("2 --> Auth", auth0)
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
    let yourAuth0Token;
    try {
        isAuthenticated = await auth0.isAuthenticated();
        if (isAuthenticated) {
            yourAuth0Token = await auth0.getTokenSilently();
            const response = await fetch('/.netlify/functions/authenticate', {
                headers: {
                    Authorization: `Bearer ${yourAuth0Token}`
                }
            });
            const data = await response.json();
            console.log('API Response:', data.message);
        } else {
            configureClient();
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
