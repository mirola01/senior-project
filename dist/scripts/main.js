// Import modules
import * as Auth from './auth.js';
import * as Database from './database.js';
import * as UI from './ui.js';
import * as Events from './events.js';
// Initialize Auth0 client as null
let auth0 = null;
let isAuthenticated = false;

// Initialize the Auth0 client when the window loads
window.addEventListener('load', async () => {
  // Initialize the Auth0 client when the window loads
  await Auth.configureClient();

  // You can access the auth0 instance if needed
  auth0 = Auth.getAuth0();
  console.log("load", auth0)
  isAuthenticated = await auth0.isAuthenticated();
  console.log("Auth?", isAuthenticated)
});

// Handle authentication button click
document.querySelector('#auth-btn').addEventListener('click', async (e) => {
  console.log("auth click")
  if (document.querySelector('#auth-btn').innerHTML === 'Login') {
    console.log("login")
    Auth.login();
  } else {
    Auth.logout();
  }
});


// UI elements
const add_nw_btn = document.querySelector('#add-new-btn');
const body_ = document.querySelector('.container');
const form = document.querySelector('.form');

add_nw_btn.addEventListener('click', (e) => {
  console.log(e)
  body_.classList.add('container-fade');
  form.style.display = 'block';
});

document.querySelector('#close-btn').addEventListener('click', (e) => {
  console.log(e)
  body_.classList.remove('container-fade');
  form.style.display = 'none';

});