import * as Auth from './auth.js';
import * as Database from './database.js';
import * as UI from './ui.js';
import * as Events from './events.js';


const add_nw_btn = document.querySelector('#add-new-btn');
const body_ = document.querySelector('.container');
const form = document.querySelector('.form');

add_nw_btn.addEventListener('click', (e) => {
  console.log(e)
  body_.classList.add('container-fade');
  form.style.display = 'block';
})

document.querySelector('#auth-btn').addEventListener('click', async (e) => {
  let auth0 = null;
  let isAuthenticated = false;
  auth0 = await Auth.configureClient();
  isAuthenticated = await auth0.isAuthenticated();
  const yourAuth0Token = await auth0.getTokenSilently();
  console.log('auth0:', auth0);
  console.log('why:', isAuthenticated);
  console.log('Auth0 Token:', yourAuth0Token);

  // Call the authentication Netlify Function
  const response = await fetch('/.netlify/functions/authenticate', {
    headers: {
      Authorization: `Bearer ${yourAuth0Token}`
    }
  });
  const data = await response.json();
  console.log('API Response:', data.message);
  if (document.querySelector('#auth-btn').innerHTML === 'Login') {
    Auth.login();
  } else {
    Auth.logout();
  }
});
document.querySelector('#close-btn').addEventListener('click', (e) => {
  console.log(e)
  body_.classList.remove('container-fade');
  form.style.display = 'none';
})