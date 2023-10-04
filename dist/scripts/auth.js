
// Fauna client
var faunadb = window.faunadb;
export var q = faunadb.query;

// Auth0 Client
let auth0 = null;
let isAuthenticated = false;

export const configureClient = async () => {
    try {
        const config = await response.json();

        auth0 = await createAuth0Client({
            domain: process.env.domain,
            client_id: process.env.clientId,
            audience: process.env.aud
        });
        console.log('Auth0 should be initialized here:', auth0);
        isAuthenticated = await auth0.isAuthenticated();
    } catch (e) {
        console.error('Auth0 client initialization failed:', e);
    }

    // const query = window.location.search;
    // if (query.includes("code=") && query.includes("state=")) {
    //     // Process the login state
    //     await auth0.handleRedirectCallback();
    // }
    return auth0;
};

export const login = async () => {
    try {
        await auth0.loginWithRedirect({
            redirect_uri: "https://lineup-manager.netlify.app/player-database.html"
        });
        
        // After successful login, the user will be redirected back to your app.
        // You can handle post-login logic in the callback handling part of your code.
    } catch (e) {
        console.error("Login failed:", e);
    }
};


export const logout = () => {
    auth0.logout({
        logoutParams: {
            returnTo: "https://lineup-manager.netlify.app"
        }
    });
};
