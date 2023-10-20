
const { DOMAIN, clientID, aud } = process.env;

exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      domain: "https://dev-n84gx3uanib6ojpf.us.auth0.com",
      client_id: clientID,
      audience: aud
    })
  };
};