require("dotenv").config();
const faunadb = require("faunadb");
const q = faunadb.query;

exports.handler = async function (event, context) {
  const { formationId } = JSON.parse(event.body);
  const _client = new faunadb.Client({
    secret: process.env.fauna_key,
    domain: "db.us.fauna.com",
    port: 443,
    scheme: "https",
  });

  try {
    let allFormations = await _client.query(q.Get(
        q.Ref(
            q.Collection('Formation'),
            formationId
        )
    )
)

    if (!allFormations) {
      allPlayers = [];
    }

    return {
      statusCode: 200,
      body: JSON.stringify(allFormations),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
