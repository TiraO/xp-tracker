let express = require('express');
const { Pool, Client } = require('pg')
let app = express();

const PORT = process.env.PORT || 3002;
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
    await pool.query("INSERT INTO assignments (person, score, description) VALUES ('"+ person + "'," + score + ", '" + description +"');")

    await pool.query('COMMIT');

};
addScore("Hamad", 100, "Mission Log 2");

