// Import required modules
require("dotenv").config();
const express = require("express");
const { auth, requiresAuth } = require("express-openid-connect");
const cors = require('cors');  // <-- Add this line

// Initialize Express app
const app = express();

// Auth0 Configuration
const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: "https://lineup-manager.netlify.app/",
  clientID: process.env.clientID,
  issuerBaseURL: process.env.DOMAIN,
  secret: process.env.clientSecret,
};

// Use Auth0 authentication
app.use(auth(config));

// Add CORS middleware  <-- Add this block
app.use(cors({
  origin: 'https://lineup-manager.netlify.app'
}));

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
