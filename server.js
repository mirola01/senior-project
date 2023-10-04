const express = require("express");
const cors = require("cors");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");
const fs = require("fs");

const app = express();

app.use(cors());

// Read Auth0 config from auth_config.json
const authConfig = JSON.parse(fs.readFileSync("auth_config.json"));

// Initialize Passport and Auth0 Strategy
const strategy = new Auth0Strategy(
  {
    domain: authConfig.domain,
    clientID: authConfig.clientId,
    clientSecret: authConfig.clientSecret,
    callbackURL: "https://lineup-manager.netlify.app/*"
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    return done(null, profile);
  }
);

passport.use(strategy);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

// Middleware
app.use(require("express-session")({ secret: authConfig.clientSecret, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Existing endpoint to serve the configuration file
app.get("/auth_config.json", (req, res) => {
  res.sendFile("auth_config.json", { root: "." });
});

// Auth0 Routes
app.get("/login", passport.authenticate("auth0", { scope: "openid email profile" }), function (req, res) {
  res.redirect("https://lineup-manager.netlify.app/");
});

app.get("/callback", passport.authenticate("auth0", { failureRedirect: "https://lineup-manager.netlify.app/" }), function (req, res) {
  res.redirect("https://lineup-manager.netlify.app/player-database.html");
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("https://lineup-manager.netlify.app/");
});

// Listen on port 3000
app.listen(process.env.PORT || 3000, () => console.log("Application running on port 3000"));
