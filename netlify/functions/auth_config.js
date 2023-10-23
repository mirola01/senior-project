
const { DOMAIN, clientID, aud, fauna_key } = process.env;

exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      domain: DOMAIN,
      client_id: clientID,
      audience: aud,
      fauna_key: fauna_key
    })
  };
};