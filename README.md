### ROOM1
```
Env: http://sybilai.com:8124
Viz: http://sybilai.com/vis/pong/
```

### Concept
We have the **environment**, the **visualizer**, and your program (lets call it **AI**).

The **environment** is the "referee".

The **visualizer** is the visual representation of the game. [Check it out](http://sybilai.com/vis/pong/) to see how it looks like.

You need to write an **AI** which will play against others' **AIs**. How? Simple, your **AI** just need to connect to the **environment** through a `TCP/IP` connection and it's ready to play. You can programme in what programming language you want, because it will run on your machine. That's it.

Every message sent from the **environment** to the **AI** and vice-versa is formed from one or more stringified JSON objects with `\n` at end. 

### Pong

Our first game is Pong, the classic game, with an added feature, it supports more than two players at once. The physics engine that runs behind our game is [box2dweb](https://code.google.com/p/box2dweb/).
u
You will need to know some geometry, but not too much. [Check this article](http://en.wikipedia.org/wiki/Regular_polygon)  about regular polygons from Wikipedia.  

To construct the regular polygon you will need the circumradius, the apothem (the distance from the center to any side) and the exterior angle.
Let's note the edge's length with `s` , the apothem with `a`, and the number of edges with `n`.

To calculate the circumradius and the apothem use this formula: <br/>
![Circumradius formula from Wikipedia](http://upload.wikimedia.org/math/a/f/d/afd0d8a51e81269521633ef79a3c22bc.png)

The exterior angle is equal with: <br />
![Formula](http://latex.codecogs.com/gif.latex?%5Cfrac%7B2%5Cpi%7D%7Bn%7D)
 
Now, the first edge has the following coordinates `[(-s/2, -a), (s/2, -a)]`.
The second edge is the first edge, rotated with the **exterior angle** in counter trigonometric direction. The same applies for the rest of the edges. <br />
![Gif](http://i.imgur.com/pu14E9H.gif)

Every player has his own edge and paddle. The paddle's position is a value between `[0, (edge's length - paddle's length)]` which represents where is the left point of the paddle on the edge. The paddle has width, height, speed, distance between the paddle and the edge, and the position on the edge.

The balls are different. For each one of the balls you get the position and the linearVelocity.

The constant datas are in the Game Rules which is the first message you will get. For number of edges, position of paddles, balls, etc, you will need to check the Game State.

### Messages

> It's necessary to put `\n` at the end of every stringified JSON object.

#### Steps
You will:
1. Connect to `http://sybilai.com:8124` by using a `TCP/IP` connection
2. Send `event:connect`
3. Get `event:game_rules`
4. Get `event:game_state`

Now you can send `event:move` and `event:game_state`, and you can get `event:move`, `event:collision`, `event:game_state`, `event:game_over`.

#### Messages (AI -> Environment)

##### Event: connect
```
{ event:"connect", 
  name:"<<your AI's name>>"
}
```

##### Event: game_state
If you want to get the game state one more time, you can ask for it.
```
{ event: "game_state" }
```

##### Event: move
If you want to move, you will need to send an event `move` with the location of where you want to get.
```
{ event: "move",
  x: integer
}
```

#### Messages (Environment -> AI)
##### Event: game_rules
GameRules is the first message you will get if you connected succesfully.
```
{ event: "game_rules",
  yourID: integer,
  gameRules: {
  	baseBallRadius: double,
  	baseEdgeWidth: integer,
  	basePaddleWidth: double,
  	basePaddleHeight: double,
  	basePaddleToEdgeDistance: double,
  	basePaddleSpeed: double,
  	framesPerSecond: integer,
  	currentTimestamp: integer // number of frames past from the start
  }
}
```

##### Event: game_state
```
{ event: "game_state",
  balls: [Ball, Ball, ... Ball],
  field: [Edge, Edge, ... Edge],
  timestamp: integer
}
```

##### Event: collision
When a ball is changing direction.
```
{ event: "collision",
  ball: Ball,
  timestamp: integer
}
```

##### Event: move
When a player wants to change his position, you will get an event `move` with his current position and his current direction. When he stops from moving, you will get a event move with direction `none`.
You will get the direction (if it is left or right) of a player once a second.
```
{ event: "move",
  player_id: integer,
  x: integer,
  direction: "left"/"none"/"right",
  timestamp: integer
}
```

##### Event: game_over
If you lose, you will get this event.
```
{ event: "game_over" }
```

#### Classes
##### Ball
```
{ id: integer,
  position: {
  	x: double,
    y: double
  },
  linearVelocity: {
  	x: double,
    y: double
  }
}
```

##### Edge
If vacant is true, there's no player on the edge and `player` is undefined.
```
{ vacant: boolean,
  player: Player
}
```

##### Player
```
{ id: integer,
  name: string,
  paddle: {
  	x: integer
  },
  action: {
  	direction: left/right/none
  }
}
```
