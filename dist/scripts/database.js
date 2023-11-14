/**
 * @file Provides database interaction functions for creating and deleting player records in the soccer team management application.
 * It utilizes FaunaDB as the backend database service.
 */

import * as Auth from "./auth.js";
var faunadb = window.faunadb;
var q = faunadb.query;

/**
 * Asynchronously creates a new player record in the FaunaDB 'Players' collection.
 * It captures form input values from the UI and associates the new player with the current authenticated user.
 * After the player is created, the page is reloaded to reflect the changes.
 */
export const new_player = async () => {
  /**
   * Check if the user is authenticated
   */
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    const decodedJWT = jwt_decode(accessToken);
    /**
     * Fetch players
     */
    const fauna_key = Auth.getFaunaKey();
    var client = new faunadb.Client({
      secret: fauna_key,
      domain: 'db.us.fauna.com',
      port: 443,
      scheme: 'https'
    });

    /**
     * Check the role
     */
    let token = await client.query(q.CurrentToken());
    token = token.value.id;

    console.log("token", token);
    let user_role = decodedJWT["https://db.fauna.com/roles"][0];
    console.log("user_role", user_role);

    /**
     * Create a new player in the FaunaDB collection
     */
    let data = await client.query(
        q.Create(q.Collection("Players"), {
          data: {
            name: document.querySelector('#playerName').value,
            age: document.querySelector('#playerAge').value,
            position: document.querySelector('#playerPosition').value,
            jersey: document.querySelector('#playerJersey').value,
            image: document.querySelector('#playerImage').value,
            owner: decodedJWT["sub"]
          }
        })
      ).then((ret) => console.log(ret))
      .catch((err) => console.error('Error: %s', err))

    console.log(data);
    window.location.reload();
  }
};
/**
 * Asynchronously deletes a player record from the FaunaDB 'Players' collection by a given player ID.
 * If the deletion is successful, the page is reloaded to reflect the changes.
 *
 * @param {string} playerId - The unique identifier of the player to be deleted.
 */
export const delete_player = async (playerId) => {
  try {
    console.log("playerid", playerId)
    const fauna_key = Auth.getFaunaKey();
    var client = new faunadb.Client({
      secret: fauna_key,
      domain: 'db.us.fauna.com',
      port: 443,
      scheme: 'https'
    });
    

      /**
       * Delete the player from the FaunaDB collection
       */
      await client.query(
        q.Delete(q.Ref(q.Collection("Players"), playerId))
      );

      // Optionally, display a success message or perform any other necessary actions
      console.log(`Player with ID ${playerId} deleted successfully.`);
      window.location.reload();
    }
   catch (error) {
    console.error('Error deleting player:', error);
  }
};