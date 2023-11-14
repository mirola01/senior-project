/**
 * @file Contains event listeners for adding and deleting players in the soccer team management application.
 * It defines the behavior for click events on specific UI elements related to player management.
 */

import { new_player, delete_player } from './database.js';

/**
 * Global click event listener that checks if the clicked element is a delete checkbox.
 * If so, it prompts the user for confirmation and proceeds to delete the player if confirmed.
 */
document.addEventListener('click', async function (e) {
    if (e.target && e.target.classList.contains('delete-checkbox')) {
      const playerId = e.target.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this player?')) {
        await delete_player(playerId);
      }
    }
});

/**
 * Attaches a click event listener to the 'Add Player' button, if it exists.
 * When clicked, it triggers the `new_player` function to add a new player.
 */
const add_btn = document.querySelector('#add-player');
if (add_btn) { // Check if the button actually exists
  add_btn.addEventListener('click', new_player);
}
