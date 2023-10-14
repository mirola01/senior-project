// Import modules
import * as Auth from './auth.js';
import * as Database from './database.js';
import * as UI from './ui.js';
import * as Events from './events.js';
// Initialize Auth0 client as null
let auth0 = null;
let isAuthenticated = false;

// Initialize the Auth0 client when the window loads
window.onload = async () => {
  auth0 = await Auth.configureClient();
  isAuthenticated = await auth0.isAuthenticated();
  console.log('Auth?', isAuthenticated);
  UI.updateUI(auth0);

};


// UI elements
const add_nw_btn = document.querySelector('#add-new-btn');
add_nw_btn.setAttribute('aria-label', 'Add new Button');

const body_ = document.querySelector('.container');
const form = document.querySelector('.form');
form.setAttribute('tabindex', '-1'); // to manage focus

// Handle authentication button click
document.querySelector('#auth-btn').addEventListener('click', async (e) => {
  console.log("auth click");
  const authBtn = document.querySelector('#auth-btn');
  authBtn.setAttribute('aria-label', authBtn.innerHTML === 'Login' ? 'Login Button' : 'Logout Button');

  if (authBtn.innerHTML === 'Login') {
    console.log("login");
    Auth.login();
  } else {
    Auth.logout();
  }
});

add_nw_btn.addEventListener('click', (e) => {
  console.log(e)
  body_.classList.add('container-fade');
  // Manage focus when form is displayed
  form.style.display = 'block';
  form.focus();
});

document.querySelector('#close-btn').addEventListener('click', (e) => {
  console.log(e)
  body_.classList.remove('container-fade');
  form.style.display = 'none';
});