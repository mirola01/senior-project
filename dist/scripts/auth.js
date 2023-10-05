
let auth0 = null;
let isAuthenticated = false;
var faunadb = window.faunadb;
var q = faunadb.query;

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
    isAuthenticated = await auth0.isAuthenticated();
    if (isAuthenticated) {
      const yourAuth0Token = await auth0.getTokenSilently();
      const response = await fetch('/.netlify/functions/authenticate', {
        headers: {
          Authorization: `Bearer ${yourAuth0Token}`
        }
      });
      const data = await response.json();
      console.log('API Response:', data.message);
    } else {
      await auth0.loginWithRedirect({
        redirect_uri: 'https://lineup-manager.netlify.app/player-database.html'
      });
    }
  } catch (e) {
    console.error('Login failed:', e);
  }
};

export const logout = () => {
  auth0.logout({
    returnTo: 'https://lineup-manager.netlify.app'
  });
};
