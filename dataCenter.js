process.title = "pongdc";

CLIENTS = [];
ENVIRONMENT = undefined;
var server_port = 8124,
    net = require('net'),
    encoding = "utf8";

var no_clients = 0;

var Client = require('./models/client_model.js');
var Environment = require('./models/environment_model.js');

var server = net.createServer( function(current_client) {
  current_client.center_id = ++no_clients;
  console.log('Trying to connect: ' + current_client.center_id);

  current_client.setEncoding( encoding );

  current_client.on( 'data', function(data) {
    console.log( 'Client ' + current_client.center_id + ' key: ' + data );

    switch ( checkKey(data) ) {
      case 'env':
        ENVIRONMENT = new Environment( current_client );

        delete current_client;
        break;

      case 'viz':
        var client = new Client();
        client.socket = current_client;
        client.permissions = {
          write: 0,
          read: 2,
          is_player: false
        }
        client.initialize();
        CLIENTS.push( client );

        delete current_client;
        break;

      case 'viz1':
        var client = new Client();
        client.socket = current_client;
        client.permissions = {
          write: 2,
          read: 1,
          is_player: false
        }
        client.initialize();
        CLIENTS.push( client );

        delete current_client;
        break;


      case 'player':
        data = JSON.parse( data );
        
        var client = new Client();
        client.name = data.name;
        client.socket = current_client;
        client.permissions = {
          write: 3,
          read: 3,
          is_player: true
        }
        client.initialize();
        CLIENTS.push( client );

        delete current_client;
        break;

      default:
        console.log('Failed to connect: ' + current_client.center_id);
        current_client.destroy();

        delete current_client;
        return;
    }
  });

  current_client.on( 'end', function() {
    console.log( 'Disconnected: ' + current_client.center_id );
  });

  current_client.on( 'error', function(exc) {
    console.log( 'Ignorin exception: ' + exc );
  });

});

server.listen( server_port );

function checkKey( data ) {

  try {
    data = JSON.parse(data);
  } catch (e) {
    return false;
  }

  if ( data.name == "env123" ) return 'env';
  if ( !ENVIRONMENT ) return false;
  if ( data.name == "viz123" ) return 'viz';
  if ( data.name == "viz124" ) return 'viz1';
  if ( data.name )  return 'player';
  return false;
}
