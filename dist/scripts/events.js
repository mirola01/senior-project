import { new_player } from './database.js';
import { login, logout } from './auth.js';


document.getElementById("auth-btn").addEventListener('click', () => {
    console.log('auth-btn clicked, innerHTML:', document.getElementById("auth-btn").innerHTML);
    if (document.getElementById("auth-btn").innerHTML == "Login") {
        login();
        console.log('login function called');
    } else {
        logout();
        console.log('logout function called');
    }
})

// Event listener for a delete button or checkbox click
document.addEventListener('click', async function (e) {
    if (e.target && e.target.classList.contains('delete-checkbox')) {
      const playerId = e.target.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this player?')) {
        await delete_player(playerId);
      }
    }
  });

//const btn = document.querySelector('#add-player');
//btn.addEventListener('click', new_player);