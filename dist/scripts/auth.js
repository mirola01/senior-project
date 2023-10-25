// Initialize Auth0 client as null
let auth0 = null;
let final_auth = null;
// Initialize authentication status as false
let isAuthenticated = false;
let fauna_key;
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
        fauna_key = config.fauna_key;

        // const token = await auth0.getTokenSilently();
        // console.log(token)
        // isAuthenticated = await auth0.isAuthenticated();
        // console.log(isAuthenticated)
    } catch (e) {
        if (config) { console.log('Auth0 config:', config); }
    }
};

export const getAuth0 = () => {
    if (final_auth) {
        return final_auth;
    }
    return auth0;
};

export const setAuth0 = (new_auth) => {
    final_auth = new_auth;
};

export const getFaunaKey = () => {
    return fauna_key;
};
// Handle user login
export const login = async () => {
    await auth0.loginWithRedirect({
        redirect_uri: 'https://lineup-manager.netlify.app/player-database.html'
    });
};

// Handle user logout
export const logout = () => {
    final_auth.logout({
        returnTo: 'https://lineup-manager.netlify.app'
    });
};
