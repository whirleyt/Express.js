
const pg = require("pg");
const postgresUrl = 'postgres://localhost/twitterdb'
const client = new pg.Client(postgresUrl)
client.connect()

module.exports = client;


