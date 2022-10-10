const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'vps.myirent.com',
    user: 'gperazzo',
    database: 'myirentc_rent',
    password: 'iRent4Now!'
});

module.exports = pool.promise();