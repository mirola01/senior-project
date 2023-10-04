
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');

exports.handler = async function(event, context) {
  // Initialize Passport and Auth0 Strategy
  const strategy = new Auth0Strategy(
    {
      domain: process.env.DOMAIN,
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
      callbackURL: 'https://your-netlify-app.netlify.app/callback'
    },
    function (accessToken, refreshToken, extraParams, profile, done) {
      return done(null, profile);
    }
  );

  passport.use(strategy);

  passport.authenticate('auth0', {
    scope: 'openid profile email'
  })(event, context);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Login function' })
  };
};