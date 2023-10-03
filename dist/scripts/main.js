import * as Auth from './auth.js';
import * as Database from './database.js';
import * as UI from './ui.js';
import * as Events from './events.js';

window.onload = async () => {
  let auth0 = null;
  let isAuthenticated = false;
  auth0 = await Auth.configureClient();
  isAuthenticated = await auth0.isAuthenticated();
  console.log('why:', isAuthenticated);
  UI.updateUI(auth0);

};


const add_nw_btn = document.querySelector('#add-new-btn');
const body_ = document.querySelector('.container');
const form = document.querySelector('.form');

add_nw_btn.addEventListener('click', (e) => {
  console.log(e)
  body_.classList.add('container-fade');
  form.style.display = 'block';
})

document.querySelector('#close-btn').addEventListener('click', (e) => {
  console.log(e)
  body_.classList.remove('container-fade');
  form.style.display = 'none';
})