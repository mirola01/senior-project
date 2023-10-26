/**
 * @fileoverview This module provides utilities for Auth0 authentication and FaunaDB integration.
 */

// Initialize Auth0 client as null
let auth0 = null;
// Initialize authentication status as false
let isAuthenticated = false;
let fauna_key;

/**
 * Fetches Auth0 configuration from server.
 * @returns {Promise<Response>} A promise that resolves with the server response.
 */
const fetchAuthConfig = () => fetch('/.netlify/functions/auth_config');

/**
 * Asynchronously configures the Auth0 client.
 * @async
 */
export const configureClient = async () => {
    let config;
    try {
        const response = await fetchAuthConfig();
        config = await response.json();
        console.log('Auth0 Config:', config);

        // Initialize Auth0 client
        auth0 = await createAuth0Client({ 
            domain: config.domain,
            client_id: config.client_id,
            audience: config.audience
        });

        // Store Fauna key in local storage
        localStorage.setItem("fauna_key", config.fauna_key);
    } catch (e) {
        if (config) { console.log('Auth0 config:', config); }
    }
};

/**
 * Retrieves the Auth0 client.
 * @returns {Object} The Auth0 client.
 */
export const getAuth0 = () => {
    let final_auth = window.localStorage.getItem("final_auth");
    if (final_auth) {
        return JSON.parse(final_auth);
    }
    return auth0;
};

/**
 * Sets the Auth0 client.
 * @param {Object} new_auth - The new Auth0 client.
 */
export const setAuth0 = (new_auth) => {
    window.localStorage.setItem("final_auth", JSON.stringify(new_auth));
};

/**
 * Sets the access token in local storage.
 * @param {string} token - The access token.
 */
export const setToken = (token) => {
    localStorage.setItem("accessToken", token);
};

/**
 * Retrieves the Fauna key from local storage.
 * @returns {string} The Fauna key.
 */
export const getFaunaKey = () => {
    return localStorage.getItem("fauna_key");
};

/**
 * @function
 * @async
 * @name login
 * @description Initiates the user login process by redirecting to the Auth0 login page.
 * After successful login, the user will be redirected to the specified URI.
 * @example
 * login();
 * @returns {Promise<void>} A Promise that resolves when the login redirect is initiated.
 */
export const login = async () => {
    await auth0.loginWithRedirect({
        redirect_uri: 'https://lineup-manager.netlify.app/player-database.html'
    });
};

/**
 * @function
 * @name logout
 * @description Logs the user out by clearing the local storage and then redirecting to the specified URI.
 * @example
 * logout();
 * @returns {void}
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
