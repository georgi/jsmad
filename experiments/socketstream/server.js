var sys    = require("sys");
var fs     = require('fs');
var http   = require("http");
var io     = require('./socket.io/lib/socket.io');


function serveFile(req, res) {
    var type = 'text/plain';

    if (req.url.match(/\.html$/)) {
        type = 'text/html';
    }

    if (req.url.match(/\.js$/)) {
        type = 'text/javascript';
    }

    if (req.url.match(/\.css$/)) {
        type = 'text/css';
    }

    res.writeHead(200, {'Content-Type': type});
    fs.readFile(req.url.slice(1), function(err, file) {
        res.end(file);
    });
}

var routes = [
    [/.*/, serveFile]
];

function controller(req, res) {
    sys.puts(req.url);

    for (var i = 0; i < routes.length; i++) {
        if (req.url.slice(1).match(routes[i][0])) {
            routes[i][1](req, res);
            return;
        }
    }
}

var server = http.createServer(controller);

server.listen(80, "0.0.0.0");

var io = io.listen(server);

io.on('connection', function(client) {

    var file = fs.createReadStream("test.mp3", { encoding: "binary" });

    file.on('data', function(data) {
        client.send({ 
            buffer: data
        });
    });

    client.on('message', function(message) {
    });

    client.on('disconnect', function(){
    });
});
