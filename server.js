const express = require("express");
// const { join } = require("path");
const app = express();

// Endpoint to serve the configuration file
app.get("/auth_config.json", (req, res) => {
  res.sendFile("auth_config.json", {root: '.'});
});

// Listen on port 3000
app.listen(3000, () => console.log("Application running on port 3000"));
