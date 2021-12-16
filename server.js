const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

// Endpoint to serve the configuration file
app.get("/auth_config.json", (req, res) => {
  res.sendFile("auth_config.json", {root: '.'});
});

// Listen on port 3000
app.listen(process.env.PORT || 3000, () => console.log("Application running on port 3000"));
