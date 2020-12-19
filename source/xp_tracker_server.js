let MessageParser = require("./message_parser")
let express = require('express');
let { Pool, Client } = require('pg');
let app = express();
let bodyParser = require('body-parser');
let PORT = process.env.PORT || 3002;
let { configTree } = require("../config/config_helper")
let config = configTree();
let axios = require("axios");

app.use(bodyParser.json({ type: 'application/*+json' }));
let jsonParser = bodyParser.json();

app.post("/assignments", jsonParser, (request, response) => {
  console.log(request.body);
  submitScore(request.body.person, request.body.score, request.body.description);
  response.send("some text");
});

app.post("/slack-events", jsonParser, async (request, apiResponse) => {
  try {
    console.log(request.body);
    let body = request.body;
    let message = body.event.text;
    if (body.type == "url_verification") {
      apiResponse.send(body.challenge);
    } else if (body.event.type == "app_mention") {
      let parser = new MessageParser();
      if (parser.classifyMessage(message) == "submitScore") {
        let assignment = parser.messageToAssignment(message);
        apiResponse.send(assignment);
        await submitScore(assignment.person, assignment.score, assignment.description, body.event.user);
      } else if (parser.classifyMessage(message) == "getOverallScore") {


        let name = parser.nameFromScoreRequest(message)

        let scoreMessage = await getOverallScore(name)
        apiResponse.send(scoreMessage);

        console.log(name, scoreMessage)
      } else if (parser.classifyMessage(message) == "reviewStudent") {

        let name = parser.nameFromReviewRequest(message);

        let history = await getScoreHistory(name);

        let formattedHistory = formatScoreHistory(history)

        apiResponse.send(formattedHistory);

        console.log(name, history)
      }

      else {
        console.log("unknown message type")
        apiResponse.send("Error")
        sendMessageFromBot("I'm not sure what you're asking");
      }

    } else {
      apiResponse.send("Error");
    }
  } catch (error) {
    apiResponse.status(500).send("Error");
  }
});

app.listen(PORT, function () {
  console.log('App listening on port ' + PORT);
});

let pool = new Pool(config.datasource);

let sendMessageFromBot = (text) => {
  axios({
    method: 'post',
    url: 'https://tirasjsclass.slack.com/api/chat.meMessage?',
    data: {
      channel: "general",
      text: text
    },
    headers: {
      Authorization: "Bearer " + config.slackBotAuth
    }
  }).catch((error) => {
    console.error(error);
  });

};

let userInTableIsAdmin = function (userResult) {
  let row = userResult.rows[0];
  let userRole = row.user_role;
  return userRole == 'admin';
};
let isUserAnAdmin = async (slackId) => {
  let userResult = await pool.query("select user_role from user_roles where slack_id=$1;", [slackId]);
  let isUserInTable = userResult.rows.length != 0;
  if (isUserInTable) {
    return userInTableIsAdmin(userResult);
  } else {
    return false
  }
};

let submitScore = async (student, score, description, user) => {
  try {
    if (await isUserAnAdmin(user) == true) {
      let scoreConfirm = student + " got a " + score + " on " + description;

      console.log(scoreConfirm);
      console.log("config.slackBotAuth", config.slackBotAuth);
      sendMessageFromBot(scoreConfirm);

      await pool.query('BEGIN');
      await pool.query("INSERT INTO assignments (person, score, description) VALUES ($1, $2, $3);", [student, score, description])
      await pool.query('COMMIT');
    } else {
      console.log(user + " tried to submit score but is not an admin");
      sendMessageFromBot("You do not have permission to add scores");
    }
  } catch (error) {
    console.error(user + " tried to submit score but an error occurred", error);
    sendMessageFromBot("An error occurred");
  }
};

let getScoreFromDatabase = async function (person) {
  let response = await pool.query("select sum(score) as xp from assignments where person = $1;", [person]);
  let row = response.rows[0];
  let overallScore = row.xp;
  return overallScore;
};

let getOverallScore = async (person) => {

  let overallScore = await getScoreFromDatabase(person);
  let overallScoreMessage = person + " has " + overallScore + " xp";

  sendMessageFromBot(overallScoreMessage);
  return overallScoreMessage
}

module.exports = { isUserAnAdmin }
