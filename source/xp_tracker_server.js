let AssignmentParser = require("./assignment_parser")
let express = require('express');
const { Pool, Client } = require('pg')
let app = express();
let bodyParser = require('body-parser')
const PORT = process.env.PORT || 3002;
const {configTree} = require("../config/config_helper");
const config = configTree();

app.use(bodyParser.json({ type: 'application/*+json' }));
let jsonParser = bodyParser.json();

app.post("/assignments", jsonParser, (request, response) => {
  console.log(request.body);
  addScore(request.body.person, request.body.score, request.body.description);
  response.send("some text");
});

app.post("/slack-events", jsonParser, (request, response)=>{
  let action = request.body;
  console.log("received " + action.type + " action from Slack.")
  if(action.type == "url_verification") {
    response.send(action.challenge);
  } else if(action.type == "event_callback"){
    let event = action.event;
    let parser = new AssignmentParser();

    let assignment = parser.messageToAssignment(event.text)
    response.send(assignment);
    addScore(assignment.person,assignment.score,assignment.description);
  } else {
    console.log(JSON.stringify(event));
    response.send("Error");
  }

});

app.listen(PORT, function () {
  console.log('App listening on port ' + PORT);
});

const pool = new Pool(config.datasource);

let addScore = async (person, score, description) => {
  let assignment = {
    person: person,
    score: score,
    description: description,
  };
  await pool.query('BEGIN');
  await pool.query("INSERT INTO assignments (person, score, description) VALUES ($1, $2, $3);", [person, score, description])
  await pool.query('COMMIT');

};