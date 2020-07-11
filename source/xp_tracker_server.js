let AssignmentParser = require("./assignment_parser")
let express = require('express');
let { Pool, Client } = require('pg')
let app = express();
let bodyParser = require('body-parser')
let PORT = process.env.PORT || 3002;
let { configTree } = require("../config/config_helper")
let config = configTree();

app.use(bodyParser.json({ type: 'application/*+json' }));
let jsonParser = bodyParser.json();

app.post("/assignments", jsonParser, (request, response) => {
  console.log(request.body);
  addScore(request.body.person, request.body.score, request.body.description);
  response.send("some text");
});

app.post("/slack-events", jsonParser, (request, response) => {
  let event = request.body;
  if (event.type == "url_verification") {
    response.send(event.challenge);
  } else if (event.type == "app_mention") {
    let parser = new AssignmentParser();

    let assignment = parser.messageToAssignment(event.text)
    response.send(assignment);
    addScore(assignment.person, assignment.score, assignment.description);
  } else {
    response.send("Error");
  }

});

app.listen(PORT, function () {
  console.log('App listening on port ' + PORT);
});

let pool = new Pool(config.datasource);

let addScore = async (person, score, description) => {
  let assignment = {
    person: person,
    score: score,
    description: description,
  };
  console.log(person + "got a" + score + "on" + description);
  await pool.query('BEGIN');
  await pool.query("INSERT INTO assignments (person, score, description) VALUES ($1, $2, $3);", [person, score, description])
  await pool.query('COMMIT');

};