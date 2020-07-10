let databaseUrl = process.env.DATABASE_URL;
let { parseDatabaseUrl } = require('./config_helper')
module.exports = {
  datasource: parseDatabaseUrl(databaseUrl),
};
