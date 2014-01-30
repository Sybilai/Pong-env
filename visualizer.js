process.title = "pongvis"

var web_sockets_server_port = 62421,
    data_center_server_port = 8124,
    WebSocketServer = require('websocket').server,
    http = require('http'),
    net = require('net');

var clients = [];
var GameRules = require('./objects/game_rules.js');
GameRules = JSON.stringify( GameRules ) + '\n';
var server = http.createServer( function(request, response) {} );

server.listen( web_sockets_server_port, function() {
  console.log((new Date()) + " Server is listening on port " + web_sockets_server_port);
});

var ws_server = new WebSocketServer({
  httpServer: server
});

ws_server.on( 'request', function(request) {
    console.log((new Date()) + ' Connection accepted. From origin  ' + request.origin + '.');

    var connection = request.accept(null, request.origin);
    var index = clients.push(connection) - 1;

    clients[index].sendUTF( GameRules );
    askForGameState();

    connection.on( 'close', function(connection) {
        console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
        clients.splice(index, 1);
    });
});

var data_center = net.createConnection( data_center_server_port, "localhost", function() {
  data_center.write('{"name":"viz123"}');
});

data_center.on( 'data', function(data) {
//  console.log( 'DC -> V: ' + data );

  for ( var i = 0; i < clients.length; ++i ) {
    clients[i].sendUTF( data );
  }
}).on( 'connect', function() {
  console.log('Connected to DataCenter');
}).on( 'close', function() {
  console.log('Disconnected from DataCenter');
});

// GAME STATE FOR VISUALIZER
data_center_advanced = net.createConnection( data_center_server_port, "localhost", function() {
  data_center_advanced.write('{"name":"viz124"}');
});

data_center_advanced.on( 'data', function(data) {
//  console.log( 'DC -> VA: ' + data );

  is_game_state_pending = false;
  for ( var i = 0; i < clients.length; ++i ) {
    if ( !clients[i].have_game_state ) {

      clients[i].sendUTF( data );
      clients[i].have_game_state = true;

    }
  }

}).on( 'connect', function() {
  console.log('Connected to DataCenter Advanced');
}).on( 'close', function() {
  console.log('Disconnected from DataCenter Advanced');
});

var game_state;
var is_game_state_pending = false;
function askForGameState() {
  if ( !is_game_state_pending ) {
    is_game_state_pending = true;
    data_center_advanced.write("{\"event\": \"game_state\"}" + '\n');
  }
}
