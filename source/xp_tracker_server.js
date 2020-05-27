let express = require('express');
const { Pool, Client } = require('pg')
let app = express();

const PORT = process.env.PORT || 3002;
app.listen(PORT, function () {
    console.log('App listening on port ' + PORT);
});

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'null',
    port: 5432,
});

let addScore = async (person, score, description) => {
    let assignment = {
        person: person,
        score: score,
        description: description,
    };
    await pool.query('BEGIN');
    await pool.query("INSERT INTO public.assignments (id, person, score, description) VALUES (1, 'Hamad', 50, 'Mission Log 1');")

    await pool.query('COMMIT');

};
addScore();

