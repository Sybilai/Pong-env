var Message = {
  socket: undefined,

  sendJSON: function(json) {
    json = JSON.stringify( json ) + '\n';
    // console.log( "E -> DC " + json );

    if (Message.socket) {
      Message.socket.write( json );
    }
  },

  game_state: function(client_id, Balls, Field) {
    var json = {
      permissions: {
        read: 1
      },
      data: {
        event: "game_state",
        balls: Balls,
        field: Field,
        timestamp: GameRules.currentTimestamp
      }
    };

    if ( client_id ) {
      json.permissions.only = [client_id];
    }

    Message.sendJSON( json );
  },

  gameRules: function(client_id) {
    var json = {
      permissions: {
        read: 2,
        only: [client_id]
      },
      data: {
        event: "game_rules",
        yourID: client_id,
        gameRules: GameRules
      }
    };

    Message.sendJSON( json );
  },

  new_user: function(edge) {
    var json = {
      permissions: {
        read: 2,
        exclude: [edge.player.id]
      },
      data: {
        event: "new_user",
        edge: edge
      }
    };

    // Message.sendJSON( json );
  },

  isMoving: function(client_id, x, status) {
    var json = {
       permissions: {
        read: 2
      },
      data: {
        event: "move",
        player_id: client_id,
        x: x,
        direction: status
      }
    };

    Message.sendJSON( json );
  },

  collision: function(ball) {
    var json = {
      permissions: {
        read: 2
      },
      data: {
        event: "collision",
        ball: ball,
        timestamp: GameRules.currentTimestamp
      }
    }

    Message.sendJSON( json );
  },

  playerIsDead: function( player_id ) {
    var json = {
      permissions: {
        read: 2,
        exclude: [player_id]
      },
      data: {
        event: "dead_player",
        player_id: player_id
      }
    }

    // Message.sendJSON( json );

    var json = {
      permissions: {
        read: 2,
        only: [player_id]
      },
      data: {
        event: "game_over"
      }
    }

    Message.sendJSON( json );
  },

  ballIsDead: function(ball_id) {
    var json = {
      permissions: {
        read: 2
      },
      data: {
        event: "lost_ball",
        player_id: ball_id
      }
    }

    // Message.sendJSON( json );
  }
}

module.exports = Message;
