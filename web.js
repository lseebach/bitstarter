var express = require('express');
var fs = require('fs');
var file = fs.readFileSync('index.html');
var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  	// write HTTP-HEAD
	response.writeHead(200);
	response.write(file,"binary");
	response.end();

});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
