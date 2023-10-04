
const jwt = require('jsonwebtoken');

exports.handler = async function(event, context) {
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