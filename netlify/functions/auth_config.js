
const { domain, clientID, aud } = process.env;

exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      domain: domain,
      client_id: clientID,
      audience: aud
    })
  };
};