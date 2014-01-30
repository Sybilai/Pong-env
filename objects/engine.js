var Box2D = require('./../lib/box2dweb.js');
var Meth = require('./meth.js');

var   b2Vec2 = Box2D.Common.Math.b2Vec2
    , b2BodyDef = Box2D.Dynamics.b2BodyDef
    , b2Body = Box2D.Dynamics.b2Body
    , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
    , b2Fixture = Box2D.Dynamics.b2Fixture
    , b2World = Box2D.Dynamics.b2World
    , b2MassData = Box2D.Collision.Shapes.b2MassData
    , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
    , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
    , b2DebugDraw = Box2D.Dynamics.b2DebugDraw
    , b2Listener = Box2D.Dynamics.b2ConctactListener;
      ;

var Engine = {
  callbackMove: undefined,
  deplaseaza: 0,

  initializeWorld: function() {
    Meth.edge_length = GameRules.baseEdgeWidth;

    this.world = new b2World( new b2Vec2(0, 0),  false );
    this.edges = [];
    this.players = {};
    this.actions = {};
    this.balls = [];
    if ( typeof Game != "undefined" )
      this.addContactListener();
  },

  initializePolygon: function(edge_length, no_edges) {
    Meth.initialize( no_edges );
  },

  calculatePolygon: function() {
    var position = {
      x: 0,
      y: - Meth.distance_from_center_to_edge - 0.5
    }
      , angle = 0;

    for (var i = 0; i < Engine.edges.length; ++i) {
      Engine.calculateEdge(Engine.edges[i], position, angle);
      angle = angle - Meth.interior_angle;
      position = Meth.rotatePoint(position, Meth.angle_center);
    }
  },

  update: function() {
    Engine.updatePlayers();
    Engine.world.Step(
        1 / GameRules.framesPerSecond   //frame-rate
      , 10       //velocity iterations
      , 10       //position iterations
    );

    Engine.world.ClearForces();
  },

  addEdge: function(edge_pointer) {
    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_staticBody;

    var fixDef = new b2FixtureDef;
    fixDef.density = 1.0;
    fixDef.friction = 0;
    fixDef.restitution = 0;

    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(Meth.edge_length/2, 1/2);

    var edge =  Engine.world.CreateBody(bodyDef).CreateFixture(fixDef);
    edge.SetUserData({
      type: 'edge',
      edge: edge_pointer
    });
    Engine.edges.push( edge );

    return edge;
  },

  calculateEdge: function(edge, position, angle) {
    edge.GetBody().SetPosition({x: position.x + this.deplaseaza, y: position.y + this.deplaseaza});
    edge.GetBody().SetAngle(angle);

    if (edge.GetUserData().player) {
      Engine.calculatePlayer( edge.GetUserData().player );
    }
  },

  destroyEdge: function( index ) {
    Engine.destroyObj( Engine.edges[index] );
    Engine.edges.splice(index, 1);
  },

  addPlayer: function(player_info, edge) {
    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_staticBody;

    bodyDef.angle = edge.GetBody().GetAngle();

    var fixDef = new b2FixtureDef;
    fixDef.density = 1.0;
    fixDef.friction = 0;
    fixDef.restitution = 0;

    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(GameRules.basePaddleWidth/2, GameRules.basePaddleHeight/2);

    var player = Engine.world.CreateBody(bodyDef).CreateFixture(fixDef);

    player.SetUserData({
      type: 'player',
      player: player_info
    });
    edge.GetUserData().player = player;
    Engine.calculatePlayer(player);

    Engine.players[ player_info.id + "" ] = player;

    return player;
  },

  calculatePlayer: function(player) {
    var paddle = player.GetUserData().player.paddle;

    var auxF = {
      first: {
        x: Engine.edges[0].GetShape().GetVertices()[3].x + GameRules.basePaddleWidth/2,
        y: -Meth.distance_from_center_to_edge + GameRules.basePaddleHeight/2 + GameRules.basePaddleToEdgeDistance
      },
      second: {
        x: Engine.edges[0].GetShape().GetVertices()[2].x + GameRules.basePaddleWidth/2,
        y: -Meth.distance_from_center_to_edge + GameRules.basePaddleHeight/2 + GameRules.basePaddleToEdgeDistance
      }
    };
    
    var cof = player.GetBody().GetAngle() / Meth.interior_angle * -1;

    var position = Meth.getThirdPoint(auxF.first, auxF.second, paddle.x);
    position = Meth.rotatePoint( position, Meth.angle_center * cof);

    player.GetBody().SetPosition({x: position.x + Engine.deplaseaza, y: position.y + Engine.deplaseaza});
  },

  destroyPlayer: function(edge) {
    if (!edge.GetUserData().player) return;

    delete Engine.players[ edge.GetUserData().edge.player.id + "" ];
    Engine.destroyObj( edge.GetUserData().player );
    delete edge.GetUserData().edge.player;
    delete edge.GetUserData().player;
  },

  updatePlayers: function() {
    for (var index in Engine.players) {
      var player = Engine.players[index];
      var action = Engine.actions[index];

      if ( !action ) return;

      var paddle = player.GetUserData().player.paddle;
      var paddle_width = GameRules.basePaddleWidth;
      var paddle_speed = GameRules.basePaddleSpeed;
      if ( paddle.x == action.x  || 
          (paddle.x == Meth.edge_length - paddle_width
            && action.x > Meth.edge_length - paddle_width) ) return;
      
      var time_now = GameRules.currentTimestamp;
      var distance = (time_now - action.timestamp)/GameRules.framesPerSecond * paddle_speed;
      distance = Math.min( Math.abs(paddle.x - action.x), distance );

      if ( paddle.x > action.x ) {
        paddle.x = Math.max( paddle.x - distance, 0 );
      } else {
        if ( paddle.x + paddle_width + distance 
              > Meth.edge_length ) {
          paddle.x = Meth.edge_length - paddle_width;
        } else {
          paddle.x = paddle.x + distance;
        }
      }

      Engine.calculatePlayer( player );

      var direction = "";
      if ( paddle.x == action.x || 
          (paddle.x == Meth.edge_length - paddle_width 
            && action.x > Meth.edge_length - paddle_width)) {
        direction = "none";
      } else if ( paddle.x < action.x ) {
        direction = "right";
      } else {
        direction = "left";
      }
      player.GetUserData().player.action.direction = direction;
      
      if (time_now - action.last_time_reported > GameRules.framesPerSecond || direction == "none") {
        if (Engine.callbackMove) Engine.callbackMove( index, paddle.x, direction);
        action.last_time_reported = time_now;
      }

      action.timestamp = time_now;
    };
  },

  destroyObj: function(obj) {
    this.world.DestroyBody( obj.GetBody() );
    delete obj;
  },

  addBall: function(ball_pointer) {
    var fixDef = new b2FixtureDef;
    fixDef.density = 1.0;
    fixDef.friction = 0;
    fixDef.restitution = 1.0;

    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_dynamicBody;
        
    fixDef.shape = new b2CircleShape( GameRules.baseBallRadius );
    bodyDef.position.x = 0 + Engine.deplaseaza;
    bodyDef.position.y = 0 + Engine.deplaseaza;
    bodyDef.linearVelocity.x = 5;
    bodyDef.linearVelocity.y = 2;

    var ball = Engine.world.CreateBody(bodyDef).CreateFixture(fixDef);

    if (ball_pointer) {
      ball_pointer.linearVelocity = ball.GetBody().GetLinearVelocity();
      ball_pointer.position = ball.GetBody().GetPosition();
    }

    ball.SetUserData({
      type: 'ball',
      ball: ball_pointer
    });

    Engine.balls.push( ball );

    return ball;
  },

  destroyBall: function(index) {
    Engine.destroyObj( Engine.balls[index] );
    Engine.balls.splice(index, 1);
  },

  debugDraw: function() {
    if (!document) return;
    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(document.getElementById("c").getContext("2d"));
    debugDraw.SetDrawScale(30);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    Engine.world.SetDebugDraw(debugDraw);
  },

  addContactListener: function() {
    var listener = new Box2D.Dynamics.b2ContactListener;
    listener.PostSolve = function(contact, impulse) {
      Game.queueCollisions.push( [contact.GetFixtureA().GetUserData(), contact.GetFixtureB().GetUserData() ] );
      Ticker.queue.push( Game.solveCollision );
    }

    Engine.world.SetContactListener( listener );
  }
}


module.exports = Engine;
