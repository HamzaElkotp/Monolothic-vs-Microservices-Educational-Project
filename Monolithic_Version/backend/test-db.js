const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/ecommerce_monolith',
});

client.connect()
    .then(() => {
        console.log('Connected directly via PG client');
        return client.query('SELECT NOW()');
    })
    .then(res => {
        console.log(res.rows);
        client.end();
    })
    .catch(err => {
        console.error('Connection error', err.stack);
        client.end();
    });
