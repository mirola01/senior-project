/**
 * @file Provides database interaction functions for creating and deleting player records in the soccer team management application.
 * It utilizes FaunaDB as the backend database service.
 */

import * as Auth from "./auth.js";
let faunadb;
if (typeof window !== "undefined") {
    // Running in a browser environment
    faunadb = window.faunadb;
  } else {
    // Running in a non-browser environment (e.g., Node.js)
    faunadb = require("faunadb");
  }
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
       * Initialize FaunaDB Client
       */
      const fauna_key = Auth.getFaunaKey();
      var client = new faunadb.Client({
          secret: fauna_key,
          domain: 'db.us.fauna.com',
          port: 443,
          scheme: 'https'
      });

      const q = faunadb.query;
      const playerData = getPlayerData();
      /**
       * Upload Image to S3 and Create Player in FaunaDB
       */
      const fileInput = document.querySelector('#playerImage');
      if (fileInput.files.length > 0) {
          const file = fileInput.files[0];
          const reader = new FileReader();
          reader.onloadend = async () => {
              try {
                  const base64String = reader.result.replace(/^data:image\/\w+;base64,/, "");

                  // Call your Netlify function's endpoint
                  const response = await fetch('/.netlify/functions/uploadImage', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${accessToken}`
                      },
                      body: JSON.stringify({ image: base64String })
                  });

                  const result = await response.json();
                  if (response.ok) {
                      // Use the returned image URL to create a new player in FaunaDB
                      let data = await client.query(
                          q.Create(q.Collection("Players"), {
                              data: {
                                  name: document.querySelector('#playerName').value || playerData.name,
                                  age: document.querySelector('#playerAge').value || playerData.age,
                                  position: document.querySelector('#playerPosition').value || playerData.position,
                                  jersey: document.querySelector('#playerJersey').value || playerData.jersey,
                                  image: result.imageUrl, // Using the returned image URL
                                  owner: decodedJWT["sub"]
                              }
                          })
                      );

                      console.log(data);
                      window.location.reload();
                  } else {
                      console.error('Error uploading image:', result.error);
                  }
              } catch (error) {
                  console.error('Error:', error);
              }
          };

          if (file) {
              reader.readAsDataURL(file);
          }
      } else {
        let data = await client.query(
            q.Create(q.Collection("Players"), {
                data: {
                    name: document.querySelector('#playerName').value,
                    age: document.querySelector('#playerAge').value,
                    position: document.querySelector('#playerPosition').value,
                    jersey: document.querySelector('#playerJersey').value,
                    image: "", 
                    owner: decodedJWT["sub"]
                }
            })
        );

        console.log(data);
        window.location.reload();
      }
  }
  else {
    console.log("No access token found.");
    window.location.href = 'https://lineup-manager.netlify.app/';
    return; 
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

export const deleteFormation = async (formationId) => {
    try {
        console.log("playerid", formationId)
        const fauna_key = Auth.getFaunaKey();
        var client = new faunadb.Client({
        secret: fauna_key,
        domain: 'db.us.fauna.com',
        port: 443,
        scheme: 'https'
        });
        await client.query(
            q.Delete(q.Ref(q.Collection("Formation"), formationId))
        );
        // Optionally, display a success message or perform any other necessary actions
        console.log(`Formation with ID ${formationId} deleted successfully.`);
        window.location.reload();
  }
 catch (error) {
  console.error('Error deleting player:', error);
}
};

const getPlayerData = () => {
    return {
        name: "Hector",
        age: 33,
        position: "Defender",
        jersey: 10
    };
  };