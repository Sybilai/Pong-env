function Environment( socket ) {
  console.log( 'Environment connected!' );

  socket.removeAllListeners( 'data' );

  socket.on( 'data', onData);

  socket.on( 'close', function() {
    console.log( 'Environment dead!' );
    for (var i = 0; i < CLIENTS.length; ++i) {
      CLIENTS[i].socket.write('{"event":"error", "message":"Server is down! What have you done???"}' + '\n');
      CLIENTS[i].socket.destroy();
    }
  });

  this.socket = socket;
}

function onData( data ) {
  // console.log( 'E -> DC: ' + data );
  var messages = data.split('\n');
  
  while ( messages.length > 1 ) {
    var message = messages.shift();
    
    try {
      message = JSON.parse( message );
    } catch (e) {
      return false;
    }

    if ( message.permissions.only ) {

      for ( var i = 0; i < message.permissions.only.length; ++i ) {
        var client_pos = clientSearchById( message.permissions.only[i] );
        var client = CLIENTS[client_pos];

        if ( !client ) continue;
        if ( client.permissions.read < message.permissions.read ) continue;

        client.socket.write( JSON.stringify( message.data ) + '\n' );

        if (message.data.event == "game_over") {
          client.socket.destroy();
          client.is_dead = true;
        }
      }

    } else {

      for (var i = 0; i < CLIENTS.length; ++i) {
        if (CLIENTS[i].permissions.read < message.permissions.read) continue;

        if ( message.permissions.exclude ) {
          if (message.permissions.exclude.indexOf( CLIENTS[i].socket.center_id ) >= 0) continue;
        }

        CLIENTS[i].socket.write( JSON.stringify( message.data ) + '\n' );
      }

    }

  }
}

function clientSearchById( center_id ) {
  for (var i = 0; i < CLIENTS.length; ++i) {
    if (CLIENTS[i].socket.center_id == center_id) {
      return i;
    }
  }
  return false;
}

module.exports = Environment;
