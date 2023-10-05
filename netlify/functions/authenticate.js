const jwt = require('jsonwebtoken');

exports.handler = async function(event, context) {
  console.log('Received event:', JSON.stringify(event, null, 2));
  if (!event.headers.authorization) {
    console.error('No Authorization header found.');
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'No Authorization header found.' })
    };
  }
  const token = event.headers.authorization.split(' ')[1];

  try {

    const decoded = jwt.verify(token, process.env.clientSecret);
    // Perform further actions based on the decoded token or user info
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User authenticated', user: decoded })
    };
  } catch (err) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' })
    };
  }
};