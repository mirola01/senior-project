import { getAuth0 } from './auth.js';
/**
 * Function to create a new player
 */
export const new_player = async () => {
  console.log('Value of auth0.isAuthenticated:', auth0.isAuthenticated);
  if (!auth0) {
    console.error('auth0 is not initialized.');
    return;
  }
  /**
 * Check if the user is authenticated
 */
  const isAuthenticated = await auth0.isAuthenticated();
  const accessToken = await auth0.getTokenSilently();
  console.log(accessToken);
  console.log("the token is " + accessToken)
  auth0 = getAuth0();
  if (isAuthenticated) {
    var client = new faunadb.Client({
      secret: String(accessToken),
      domain: 'db.us.fauna.com',
      port: 443,
      scheme: 'https'
    })

    /**
 * Create a new player in the FaunaDB collection
 */
    let data = await client.query(
        q.Create(q.Collection("Players"), {
          data: {
            name: document.querySelector('#playerName').value,
            age: document.querySelector('#playerAge').value,
            position: document.querySelector('#playerPosition').value,
            owner: q.CurrentIdentity()
          }
        })
      ).then((ret) => console.log(ret))
      .catch((err) => console.error('Error: %s', err))

    console.log(data);
    // note_container.appendChild(add_new_card);
    body_.classList.remove('container-fade');
    form.style.display = 'none';
    window.location.reload();
  }
};
/**
 * Function to delete a player by ID
 */
const delete_player = async (playerId) => {
  try {
    const isAuthenticated = await auth0.isAuthenticated();
    const accessToken = await auth0.getTokenSilently();

    if (isAuthenticated) {
      var client = new faunadb.Client({
        secret: String(accessToken),
        domain: 'db.us.fauna.com',
        port: 443,
        scheme: 'https'
      });

      /**
 * Delete the player from the FaunaDB collection
 */
      // Use q.Delete to remove the player document by ID
      await client.query(
        q.Delete(q.Ref(q.Collection("Players"), playerId))
      );

      // Optionally, display a success message or perform any other necessary actions
      console.log(`Player with ID ${playerId} deleted successfully.`);
      window.location.reload();
    }
  } catch (error) {
    console.error('Error deleting player:', error);
  }
};
