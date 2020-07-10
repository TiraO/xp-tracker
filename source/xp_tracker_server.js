let AssignmentParser = require("./assignment_parser")
let express = require('express');
const { Pool, Client } = require('pg')
let app = express();
let bodyParser = require('body-parser')
const PORT = process.env.PORT || 3002;

app.use(bodyParser.json({ type: 'application/*+json' }));
let jsonParser = bodyParser.json();

app.post("/assignments", jsonParser, (request, response) => {
  console.log(request.body);
  addScore(request.body.person, request.body.score, request.body.description);
  response.send("some text");
});

app.post("/slack-events", jsonParser, (request, response)=>{
  let event = request.body;
  console.log("received " + event.type + " event from Slack.")
  if(event.type == "url_verification") {
    response.send(event.challenge);
  } else if(event.type == "app_mention"){
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

const pool = new Pool({
  user: 'app_admin',
  host: 'localhost',
  database: 'xptracker',
  password: 'password123',
  port: 5432,
});

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