/**
 * @fileoverview This module provides utilities for Auth0 authentication and FaunaDB integration.
 */

// Initialize Auth0 client as null
let auth0 = null;

// Initialize authentication status as false
let isAuthenticated = false;

// Initialize fauna_key as undefined
let fauna_key;

/**
 * Fetches Auth0 configuration from the server.
 * @returns {Promise<Object>} A promise that resolves with the Auth0 configuration object.
 */
const fetchAuthConfig = () => fetch('/.netlify/functions/auth_config');

/**
 * Asynchronously configures the Auth0 client with the fetched configuration.
 * Initializes the Auth0 client and stores the Fauna key in local storage.
 * @async
 */
export const configureClient = async () => {
    try {
        const response = await fetchAuthConfig();
        const config = await response.json();
        console.log('Auth0 Config:', config);

        // Initialize Auth0 client with the configuration
        auth0 = await createAuth0Client({ 
            domain: config.domain,
            client_id: config.client_id,
            audience: config.audience
        });

        // Store Fauna key in local storage
        localStorage.setItem("fauna_key", config.fauna_key);
    } catch (e) {
        console.error('Error in Auth0 client configuration:', e);
    }
};

/**
 * Retrieves the Auth0 client from local storage or the initialized variable.
 * @returns {Object} The Auth0 client instance.
 */
export const getAuth0 = () => {
    const finalAuth = window.localStorage.getItem("final_auth");
    return finalAuth ? JSON.parse(finalAuth) : auth0;
};

/**
 * Stores the Auth0 client in local storage.
 * @param {Object} newAuth - The Auth0 client instance to store.
 */
export const setAuth0 = (newAuth) => {
    window.localStorage.setItem("final_auth", JSON.stringify(newAuth));
};

/**
 * Stores the access token in local storage.
 * @param {string} token - The access token to store.
 */
export const setToken = (token) => {
    localStorage.setItem("accessToken", token);
};

/**
 * Retrieves the Fauna key from local storage.
 * @returns {string} The stored FaunaDB key.
 */
export const getFaunaKey = () => {
    return localStorage.getItem("fauna_key");
};

/**
 * Initiates the user login process by redirecting to the Auth0 login page.
 * @async
 * @example
 * login();
 * @returns {Promise<void>} A promise that resolves when the login redirect is initiated.
 */
export const login = async () => {
    await auth0.loginWithRedirect({
        redirect_uri: window.location.origin + '/player-database.html'
    });
};

/**
 * Logs the user out by clearing the local storage and redirecting to the home page.
 * @example
 * logout();
 */
export const logout = () => {
    let final_auth = window.localStorage.getItem("final_auth");
    localStorage.clear();
    if (final_auth) {
        final_auth.logout({
            returnTo: 'https://lineup-manager.netlify.app'
        });
    }
    auth0.logout({
        returnTo: 'https://lineup-manager.netlify.app'
    });
};
