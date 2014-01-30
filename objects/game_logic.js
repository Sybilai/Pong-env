var http = require('http');

GameRules = require('./game_rules.js');
Engine = require('./engine.js');

var Edge = require('./../models/env/edge_model.js'),
    Player = require('./../models/env/player_model.js'),
    Ball = require('./../models/env/ball_model.js'),
    Action = require('./../models/env/action_model.js');

var Game = {
  field: [],
  balls: [],
  actions: {},
  players: {},
  scoring: {},
  queueData: [],
  queueCollisions: [],

  initialize: function() {
    Engine.actions = Game.actions;
    Engine.callbackMove = Message.isMoving;

    for (var i = 0; i < 4; ++i) {
      Game.field.push( new Edge(true) );
    }

    Engine.initializeWorld();
    Engine.initializePolygon(GameRules.baseEdgeWidth, Game.field.length);

    for (var i = 0, l = Game.field.length; i < l; ++i) {
      Engine.addEdge( Game.field[i] );
    }

    Engine.calculatePolygon();

    while ( Game.isBallNeeded() ) Game.createBall();
  },


  addPlayer: function( name, player_id ) {
    var player = new Player( name, player_id ),
        edge   = new Edge( false, player );

    Game.players[ player_id + "" ] = edge.player;

    var have_vacant_edge = false;
    for (var i = 0, l = Game.field.length; i < l; ++i) {
      if (Game.field[i].vacant) {
        Game.field[i] = edge;
        Engine.edges[i].GetUserData().edge = edge;
        Engine.addPlayer( player, Engine.edges[i] );
        have_vacant_edge = true;
        break;
      }
    }

    if ( !have_vacant_edge ) {
      Game.field.push( edge );
      var edge_pointer = Engine.addEdge( edge );
      Engine.calculatePolygon();
      Engine.addPlayer( player, edge_pointer );
    }

    return edge;
  },

  destroyPlayerByID: function( player_id ) {
    for (var i = 0, l = Game.field.length; i < l; ++i) {
      if ( !Game.field[i].vacant ) {
        if (Game.field[i].player.id == player_id) {
          Engine.destroyPlayer( Engine.edges[i] );

          if ( l > 4 ) {
            Game.field.splice(i, 1);

            Engine.destroyEdge( i );
            Engine.initializePolygon(GameRules.baseEdgeWidth, Game.field.length);
            Engine.calculatePolygon();
          } else {
            Game.field[i].vacant = true;
            delete Game.field[i].player;
          }
          break;
        }
      }
    }

    delete Game.actions[ player_id + ""];
    delete Game.players[ player_id + ""];
  },

  isBallNeeded: function() {
    return (Game.balls.length < 1);
  },

  createBall: function() {
    var ball = new Ball();
    Game.balls.push( ball );
    Engine.addBall( ball);
  },

  destroyBallByID: function( ball_id ) {
    for (var i = 0; i < Game.balls.length; ++i) {
      if ( Game.balls[i].id == ball_id ) {
        Engine.destroyBall(i);
        Game.balls.splice(i, 1);
        break;
      }
    }
  },


  setAction: function( x, player_id ) {
    x = Math.max( x, 0 );
    x = Math.min( x, GameRules.baseEdgeWidth );

    Engine.actions[ player_id + "" ] = 
      Game.actions[ player_id + "" ] = new Action( x );
  },


  solveCollision: function() {
    var collision = Game.queueCollisions.shift();
    var body1 = collision[0];
    var body2 = collision[1];

    if ( body1.type == 'edge' || body1.type == 'player' ) {
      if ( body2.type == 'ball' ) {
        var aux = body1;
        body1 = body2;
        body2 = aux;
      }
    }

    if ( body1.type != 'ball' ) return;

    switch (body2.type) {
      case 'ball':
        var aux = body2.ball.last_player_id;
        body2.ball.last_player_id = body1.ball.last_player_id;
        body1.ball.last_player_id = aux;
        Message.collision( body2.ball );
        Message.collision( body1.ball );
        break;

      case 'edge':
        if (body2.edge.vacant == true) {
          Message.collision( body1.ball );
          break;
        }

        if (Game.scoring[ body1.ball.last_player_id + "" ]) {
          ++Game.scoring[ body1.ball.last_player_id + "" ];
        } else {
          Game.scoring[ body1.ball.last_player_id + "" ] = 1;
        }

        http.request({host: '95.85.45.192', 
                     path: '/api/new_scoring/?name='+body2.edge.player.name+'&scoring='+ Game.scoring[ body2.edge.player.id ]
        }).end();

        Message.playerIsDead( body2.edge.player.id );
        Game.destroyPlayerByID( body2.edge.player.id );

        Game.destroyBallByID( body1.ball.id );
        if ( Game.isBallNeeded() ) Game.createBall();

        Message.game_state(false, Game.balls, Game.field);
        break;

      case 'player':
        body1.ball.last_player_id = body2.player.id;
        Message.collision( body1.ball );
        break;

    }

  },

  solveData: function() {
    var data = Game.queueData.shift();
    console.log("DC -> E: " + data);

    messages = data.split('\n');

    while ( messages.length > 1 ) {
      message = JSON.parse( messages.shift() );

      switch ( message.event ) {
        case 'new_client':
          if ( !message.value.permissions.is_player ) break;
          var edge = Game.addPlayer( message.value.name, message.value.client_id );

          Message.new_user( edge );
          Message.gameRules( edge.player.id );
          Message.game_state( false, Game.balls, Game.field );
          break;

        case 'destroy_client':
          Game.destroyPlayerByID( message.value.client_id );

          Message.game_state( false, Game.balls, Game.field );
          break;

        case 'game_state':
          Message.game_state( message.client_id, Game.balls, Game.field );
          break;

        case 'move':
          Game.setAction( message.x, message.client_id );
          break;

        default:
          console.log( 'What the f*ck is that? ', data.toString() );
      }
    }

  }
};

module.exports = Game;
