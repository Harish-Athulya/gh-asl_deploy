var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '162.241.123.158',
    user     : 'theatgg6_flutter',
    password : '=sO%KCwGZQYn',
    database : 'theatgg6_flutter_db',
});

connection.connect();

console.log('db connected...');

module.exports = connection