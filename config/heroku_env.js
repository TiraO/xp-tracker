let databaseUrl = process.env.DATABASE_URL;
let slackBotAuth = process.env.SLACK_BOT_AUTH;
let { parseDatabaseUrl } = require('./config_helper')
module.exports = {
  datasource: parseDatabaseUrl(databaseUrl),
  slackBotAuth,
};
