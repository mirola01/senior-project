/**
 * @file Contains event listeners for adding and deleting players in the soccer team management application.
 * It defines the behavior for click events on specific UI elements related to player management.
 */

import { new_player, delete_player } from './database.js';


/**
 * Attaches a click event listener to the 'Add Player' button, if it exists.
 * When clicked, it triggers the `new_player` function to add a new player.
 */
const add_btn = document.querySelector('#add-player');
if (add_btn) { // Check if the button actually exists
  add_btn.addEventListener('click', new_player);
}
