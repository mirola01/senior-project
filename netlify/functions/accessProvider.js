import * as Auth from "dist\scripts\auth.js";
// Import the FaunaDB client
const faunadb = require('faunadb');
const q = faunadb.query;


// Main handler function for the Netlify function
exports.handler = async function (event, context) {
  // Function to create an access provider in FaunaDB
  const createProvider = async () => {
    const AssignRole = (faunaRole, auth0Role) => {
      return {
        role: q.Role(faunaRole),
        predicate: q.Query(q.Lambda('accessToken',
          q.ContainsValue(auth0Role, q.Select(["https:/db.fauna.com/roles"], q.Var('accessToken')))
        ))
      }
    }
    const auth0 = Auth.getAuth0();
    const accessToken = await auth0.getTokenSilently();

    const _client = new faunadb.Client({
      secret: String(accessToken),
      domain: 'db.us.fauna.com',
      port: 443,
      scheme: 'https'
    })

    return await _client.query(
      q.CreateAccessProvider({
        "name": "Auth0",
        "issuer": `https://${process.env.DOMAIN}/`,
        "jwks_uri": `https://${process.env.DOMAIN}/.well-known/jwks.json`,
        "membership": [
          AssignRole('writer', 'user'),
          AssignRole('writer_admin', 'admin')
        ]
      })
    )
  }
  // Try to create the access provider and handle errors
  try {
    const result = await createProvider();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Access Provider Created',
        data: result
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error',
        error: err
      })
    };
  }
};