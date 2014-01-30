process.title = "pongenv";

console.log('Whattt'); // I get a stupid error when using forever if I am not doing this.

var net = require('net'),
    data_center_server_port = 8124;

Message = require('./objects/messages.js');
Game = require('./objects/game_logic.js');
Ticker = require('./objects/ticker.js');

var socket = net.createConnection( data_center_server_port, "localhost", function() {
  socket.setEncoding('utf8');
  socket.write('{"name": "env123"}');
  Message.socket = socket;
  Game.initialize();
  Ticker.initialize();
});

socket.on( 'data', function(data) {
  Game.queueData.push( data );
  Ticker.queue.push( Game.solveData );
}).on('connect', function() {
  console.log('Connected to DataCenter!');
}).on('close', function() {
  console.log('Disconnected from DataCenter!');
});

