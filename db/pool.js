const { Pool } = require("pg");
require('dotenv').config()

// All of the following properties should be read from environment variables
// We're hardcoding them here for simplicity

// Again, this should be read from an environment variable
module.exports = new Pool({
  connectionString: process.env.DB_URI
});