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

app.post("/slack-events", jsonParser, async (request, response) => {
  console.log(request.body);
  let body = request.body;
  let message = body.event.text;
  if (body.type == "url_verification") {
    response.send(body.challenge);
  } else if (body.event.type == "app_mention") {
    let parser = new MessageParser();
    // let assignment = parser.messageToAssignment(message);
    // response.send(assignment);
    // submitScore(assignment.person, assignment.score, assignment.description);
    let name = parser.nameFromScoreRequest(message)

    let scoreMessage = await getOverallScore(name)
    response.send(scoreMessage);

    console.log(name,scoreMessage)
  } else {
    response.send("Error");
  }

});

app.listen(PORT, function () {
  console.log('App listening on port ' + PORT);
});

let pool = new Pool(config.datasource);

let submitScore = async (person, score, description) => {

  let scoreConfirm = person + " got a " + score + " on " + description;
  console.log(scoreConfirm);
  console.log("config.slackBotAuth", config.slackBotAuth);
  axios({
    method: 'post',
    url: 'https://tirasjsclass.slack.com/api/chat.meMessage?',
    data: {
      channel: "general",
      text: scoreConfirm
    },
    headers: {
      Authorization: "Bearer " + config.slackBotAuth
    }
  }).catch((error)=>{
    console.error(error);
  });


  await pool.query('BEGIN');
  await pool.query("INSERT INTO assignments (person, score, description) VALUES ($1, $2, $3);", [person, score, description])
  await pool.query('COMMIT');

};

let getOverallScore = async (person) => {

  let response = await pool.query("select sum(score) as xp from assignments where person = $1;", [person]);
  let row = response.rows[0];
  let overallScore = row.xp;
  let overallScoreMessage = person + " has " + overallScore + " xp";

  axios({
    method: 'post',
    url: 'https://tirasjsclass.slack.com/api/chat.meMessage?',
    data: {
      channel: "general",
      text: overallScoreMessage
    },
    headers: {
      Authorization: "Bearer " + config.slackBotAuth
    }
  }).catch((error)=>{
    console.error(error);
  });
  return overallScoreMessage
}