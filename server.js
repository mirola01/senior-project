// Import required modules
require("dotenv").config();

const express = require("express");
const { auth, requiresAuth } = require("express-openid-connect");

// Initialize Express app
const app = express();

// Auth0 Configuration
const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: "https://lineup-manager.netlify.app/", 
  clientID: process.env.clientID, // Your Auth0 Client ID
  issuerBaseURL: "dev-n84gx3uanib6ojpf.us.auth0.com", // Your Auth0 Domain
  secret: process.env.clientSecret,
};

// Use Auth0 authentication
app.use(auth(config));

// Define routes
app.get("/", (req, res) => {
  res.send(req.oidc.isAuthenticated() ? "Logged in" : "Logged out");
});

app.get("/profile", requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user, null, 2));
});

// Start server
app.listen(3000, function () {
  console.log("Listening on http://localhost:3000");
});
