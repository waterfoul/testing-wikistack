var http = require('http');
var server = http.createServer();
var models = require('./models');
var Promise = require('bluebird');

server.on('request', require('./app'));

//sync creates the table if it does not exist. Force true drops the table first if it exists
//order matters because we cannot drop the User table if there are items in the Page table that reference it
models.Page.sync({force: true}) 
	.then(() => models.User.sync({force: true}))
    .then(function () {
        server.listen(3001, function () {
            console.log('Server is listening on port 3001!');
        });
    })
    .catch(console.error);

