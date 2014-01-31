### ROOM1
```
Env: http://sybilai.com:8124
Viz: http://sybilai.com/vis/pong/
```

### ROOM2
```
Env: http://sybilai.com:8125
Viz: http://sybilai.com/vis/pong2/
```

### Concept
We have the **environment**, the **visualizer** and your program (lets call it **AI** because this is what is it).

**Environment** is our "referee".

**Visualizer** is the visual representation of the game. [Check it out](http://sybilai.com/vis/pong/) to see how it looks like.

You need to make an **AI** which would play versus other's **AIs**. How? Very easy, your code just need to connect to **environment** through a `TCP/IP` connection and it's ready to play. You can programming in what ever you want, because it will run on your machine and it will need just to connect to our server. That's it.

Every message sent from **environment** to **AI** and vice-versa is formed from one, or more, stringified JSON object with `\n` at end. 

### Pong

Our first game is Pong, the classic game, with one improvement, supports more players at once. Engine physics from behind is [box2dweb](https://code.google.com/p/box2dweb/).

You will need to know some geometry, but not to much. [Check this article](http://en.wikipedia.org/wiki/Regular_polygon)  about regular polygons from Wikipedia.  

For calculating the polygon (which is regular) we will need circumradius, apothem (the distance from the center to any side) and exterior angle.
Lets note with `s` the edge's length, with `a` the apothem and with `n` the number of edges.

For circumradius and apothem use this formula: <br/>
![Circumradius formula from Wikipedia](http://upload.wikimedia.org/math/a/f/d/afd0d8a51e81269521633ef79a3c22bc.png)

The exterior angle is equal with: <br />
![Formula](http://latex.codecogs.com/gif.latex?%5Cfrac%7B2%5Cpi%7D%7Bn%7D)
 
Now, first edge has this coordinates `[(-s/2, -a), (s/2, -a)]`.
Second edge is the first edge, rotated with the **exterior angle** in counter trigonometric direction. And so on. <br />
![Gif](http://i.imgur.com/pu14E9H.gif)


Every player has his own edge and paddle. Paddle's position is a value between `[0, (edge's length - paddle's length)]` which represents where is the left point of the paddle on the edge. Paddle has width, height, speed, distance between paddle and edge, and position on edge, so keep an eye on all of them.

Balls are different. For each one you get the position and the linearVelocity.

The constant datas are in Game Rules which is first thing you will get. For number of edges, position of paddles, balls, etc, you will need to check the Game State.

### Messages

> It's necessary to put `\n` at the end of every stringified JSON object.

#### Steps
You will:
1. Send `event:connect`
2. Get `event:game_rules`
3. Get `event:game_state`

Now you can send `event:move` and `event:game_state`, and you can get `event:move`, `event:collision`, `event:game_state`, `event:game_over`.

#### Messages (AI -> Environment)

##### Event: connect
```
{ event:"connect", 
  name:"<<your AI's name>>"
}
```

##### Event: game_state
If you want one more time the game state, you can ask for it.
```
{ event: "game_state" }
```

##### Event: move
If you want to move, you need to send a event `move` with location where you want to get.
```
{ event: "move",
  x: integer
}
```

#### Messages (Environment -> AI)
##### Event: game_rules
GameRules is first message you will get if you connected succesfully.
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
When a player wants to change his position, you will get an event `move` with his current position and his direction. When he stops from moving, you will get a event move with direction `none`.
You will get the direction (if is left or right) of a player once a second.
```
{ event: "move",
  player_id: integer,
  x: integer,
  direction: "left"/"none"/"right",
  timestamp: integer
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
```
##### Edge
If vacant is true, there's no player on the edge and `player` is undefined.
```
{ vacant: boolean,
  player: Player
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
```
