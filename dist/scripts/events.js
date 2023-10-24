import { new_player, delete_player } from './database.js';
import { login, logout } from './auth.js';

/**
 * Event listener for a delete button or checkbox click
 */
document.addEventListener('click', async function (e) {
    if (e.target && e.target.classList.contains('delete-checkbox')) {
      const playerId = e.target.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this player?')) {
        await delete_player(playerId);
      }
    }
});

const add_btn = document.querySelector('#add-player');
if (add_btn) { // Check if the button actually exists
  add_btn.addEventListener('click', new_player);
}
