const faunadb = require("faunadb");
const q = faunadb.query;
const axios = require("axios").default;


// const client

const createProvider = async () => {
    const resp = await axios.get("https://git.heroku.com/lineup-manager.git/auth_config.json");
    const config = resp.data;
    const AssignRole = (faunaRole, auth0Role) => {
        return {
            role: q.Role(faunaRole),
            predicate: q.Query(q.Lambda('accessToken',
            q.ContainsValue(auth0Role, q.Select(["https:/db.fauna.com/roles"], q.Var('accessToken')))
            ))
        }
    }
    
    const _client = new faunadb.Client({
        secret: config.fauna_key,
        domain: 'db.us.fauna.com',
        port: 443,
        scheme: 'https'
    })
    
    return await _client.query(
        q.CreateAccessProvider(
            {
                "name": "Auth0",
                "issuer": `https://${config.domain}/`,
                "jwks_uri": `https://${config.domain}/.well-known/jwks.json`,
                "membership": [
                    AssignRole('writer', 'user'),
                    AssignRole('writer_admin', 'admin')
                ]
            }
        )
    )

}

const result = createProvider()
    .then((data)=>console.log("SUCCESS",data))
    .catch((err)=>console.error("ERROR",err))