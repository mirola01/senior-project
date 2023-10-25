require("dotenv").config();
const faunadb = require("faunadb");
const q = faunadb.query;

exports.handler = async function (event, context) {
  const { userId } = JSON.parse(event.body);
  const _client = new faunadb.Client({
    secret: process.env.fauna_key,
    domain: "db.us.fauna.com",
    port: 443,
    scheme: "https",
  });

  try {
    let allPlayers = await _client.query(
      q.Map(
        q.Paginate(q.Match(q.Index("players_by_owner"), userId)),
        q.Lambda("X", q.Get(q.Var("X")))
      ),
      { secret: event.body.token }
    );

    if (!allPlayers) {
      allPlayers = [];
    }

    return {
      statusCode: 200,
      body: JSON.stringify(allPlayers),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
