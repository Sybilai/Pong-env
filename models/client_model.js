function Client() {
  this.socket = this.permissions = false;
  this.is_dead = false;
  this.name = undefined;
}

Client.prototype.initialize = function() {
  var self = this;

  console.log( 'Client initialize: ' + self.socket.center_id );

  if ( self.permissions.is_player ) {
    self.announceMe();
  }

  self.socket.removeAllListeners( 'data' );

  self.socket.on( 'data', function( data ) {
    self.sendData( data );
  });

  self.socket.on( 'close', function() {
    console.log( 'Client disconnected: ' + self.socket.center_id );
    CLIENTS.splice( CLIENTS.indexOf( self ), 1 );
    if ( self.permissions.is_player && !self.is_dead) {
      self.announceMyDeath();
    }
  });

  self.socket.on( 'error', function(exc) {
    console.log( 'Ignorin exception: ' + exc );
  });

}

Client.prototype.sendData = function( data ) {
  var self = this;
  console.log( 'C -> DC: ' + self.socket.center_id + ': ' + data );

  var messages = data.split('\n');

  while ( messages.length > 1 ) {
    var message = messages.shift();

    if ( !(message = isValid( self, message )) ) continue;

    if (self.permissions.write < message.permissions.write) continue;

    ENVIRONMENT.socket.write( JSON.stringify( message.data ) + '\n' );
  }
}

Client.prototype.announceMe = function() {
  var self = this;
  var message = {
    event: "new_client",
    value: {
      client_id: self.socket.center_id,
      name: self.name,
      permissions: self.permissions
    }
  };

  ENVIRONMENT.socket.write( JSON.stringify( message ) + '\n' );
}

Client.prototype.announceMyDeath = function() {
  var self = this;
  var message = {
    event: "destroy_client",
    value: {
      client_id: self.socket.center_id,
      permissions: self.permissions
    }
  };

  ENVIRONMENT.socket.write( JSON.stringify( message ) + '\n' );
}


var isValid = function( self, message ) {

  try {
    message = JSON.parse( message );
  } catch (e) {
    console.log('Client ' + self.socket.center_id + ' invalid data');

    self.socket.write( JSON.stringify({
      event: "message_error",
      message: "Check the documentation to see what to send."
    }));

    return false;
  }

  switch ( message.event ) {
    case 'move':
      var aux = {
        permissions: {
          read: 5,
          write: 3
        },
        data: message
      };
      aux.data.client_id = self.socket.center_id;
      return aux;
      break;

    case 'game_state':
      var aux = {
        permissions: {
          read: 5,
          write: 1
        },
        data: message
      };
      aux.data.client_id = self.socket.center_id;
      return aux;
      break;

    default:
      return false;
  }

  return false;
}

module.exports = Client;
