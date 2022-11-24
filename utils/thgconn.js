var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : '162.241.123.158',
    user     : 'theatgg6_flutter',
    password : '=sO%KCwGZQYn',
    database : 'theatgg6_sal_subscriber102',
});

connection.connect();

console.log('thg db connected...');

module.exports = connection