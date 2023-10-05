let auth0 = null;
let isAuthenticated = false;
var faunadb = window.faunadb;
export var q = faunadb.query;

export const configureClient = async () => {
    try {
        const response = await fetch('/.netlify/functions/auth_config');
        const config = await response.json();
        auth0 = await createAuth0Client({
            domain: config.domain,
            client_id: config.client_id,
            audience: config.audience
        });
    } catch (e) {
        console.error('Auth0 client initialization failed:', e);
    }
};
export const getAuth0 = () => {
    return auth0;
};

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
            console.log("Not auth", auth0)
        }
        await auth0.loginWithRedirect({
            redirect_uri: 'https://lineup-manager.netlify.app/player-database.html'
        });
    } catch (e) {
        console.error('Login failed:', e);
    }
};

export const logout = () => {
    auth0.logout({
        returnTo: 'https://lineup-manager.netlify.app'
    });
};