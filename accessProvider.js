// Import the FaunaDB client
const faunadb = require("faunadb");
const q = faunadb.query;

// const client

const createProvider = async () => {
  const AssignRole = (faunaRole, auth0Role) => {
    return {
      role: q.Role(faunaRole),
      predicate: q.Query(q.Lambda('accessToken',
        q.ContainsValue(auth0Role, q.Select(["https:/db.fauna.com/roles"], q.Var('accessToken')))
      ))
    }
  }

  const _client = new faunadb.Client({
    secret: process.env.fauna_key,
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

const result = createProvider()
  .then((data) => console.log("SUCCESS", data))
  .catch((err) => console.error("ERROR", err))