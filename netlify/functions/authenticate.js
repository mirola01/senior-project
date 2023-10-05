// Import the JSON Web Token library
const jwt = require('jsonwebtoken');

// Main handler function for the Netlify function
exports.handler = async function(event, context) {
  console.log('Received event:', JSON.stringify(event, null, 2));
// Check for the presence of the Authorization header
  if (!event.headers.authorization) {
    console.error('No Authorization header found.');
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'No Authorization header found.' })
    };
  }
// Extract the token from the Authorization header
  const token = event.headers.authorization.split(' ')[1];

// Try to decode the token and handle errors
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