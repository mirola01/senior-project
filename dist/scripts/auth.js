// Fauna client
var faunadb = window.faunadb;
export var q = faunadb.query;

// Auth0 Client
let auth0 = null;
const REDIRECT_URI = 'https://lineup-manager.netlify.app/player-database.html';
const RETURN_TO = 'https://lineup-manager.netlify.app';
let isAuthenticated = false;

export const configureClient = async () => {
    try {
        // Fetch Auth0 configuration from the server
        const response = await fetch('/.netlify/functions/auth_config');
        const config = await response.json();
        auth0 = await createAuth0Client({
            domain: config.domain,
            client_id: config.client_id,
            audience: config.audience
        });
        console.log('Auth0 should be initialized here:', auth0);
        isAuthenticated = await auth0.isAuthenticated();
    } catch (e) {
        console.error('Auth0 client initialization failed:', e);
        return null;
    }

    // const query = window.location.search;
    // if (query.includes("code=") && query.includes("state=")) {
    //     // Process the login state
    //     await auth0.handleRedirectCallback();
    // }
    return auth0;
};

export const login = async () => {
    let yourAuth0Token = null;

    // Initialize Auth0 client if not already done
    if (!auth0) {
        auth0 = await configureClient();
    }

    // Check if user is authenticated
    isAuthenticated = await auth0.isAuthenticated();
    if (!isAuthenticated) {
        yourAuth0Token = await auth0.getTokenSilently();
        // Call the authentication Netlify Function
        const response = await fetch('/.netlify/functions/authenticate', {
            headers: {
                Authorization: `Bearer ${yourAuth0Token}`
            }
        });
        const data = await response.json();
        console.log('API Response:', data.message);
    }
    try {
        await auth0.loginWithRedirect({
            redirect_uri: REDIRECT_URI
        });

        // After successful login, the user will be redirected back to your app.
        // You can handle post-login logic in the callback handling part of your code.
    } catch (e) {
        console.error("Login failed:", e);
        // Handle specific errors here
    }
};


export const logout = () => {
    auth0.logout({
        logoutParams: {
            returnTo: RETURN_TO
        }
    });
};