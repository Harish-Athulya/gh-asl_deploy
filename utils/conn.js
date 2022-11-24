var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '162.241.222.86',
  user     : 'harish',
  password : '_Fmit183',
  database : 'admin_flutter_db'
});

connection.connect();

console.log('db connected...');

module.exports = connection