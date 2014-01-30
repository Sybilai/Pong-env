Documentatie
-------------

```
dataCenter Port: 8124
Visualizer Port: 62421
```

Pornire
-----------------

```
nodejs dataCenter.js
nodejs environment.js
nodejs visualizer.js
```

Set de date
---------------

Connect (Mesajul de conectare necesar)

```JSON
{"event":"connect","name":"<<ai's name here>>"}
```

Game Rules

```JSON
{"event":"game_rules","yourID":44,"gameRules":{
  "baseBallRadius":0.2,
  "baseEdgeWidth":5,
  "basePaddleWidth":1,
  "basePaddleHeight":0.2,
  "basePaddleToEdgeDistance":0.2,
  "basePaddleSpeed":2,
  "framesPerSecond":30,
  "currentTimestamp":2010
}}
```

Game State (normal, contine entere doar la final)

```JSON
{"event":"game_state",
"balls":[{"id":98688055,"position":{"x":1.7666666695000584,"y":-1.1333333333333306},"linearVelocity":{"x":5.000000000000001,"y":1.9999999999999931},"last_player_id":0}],
"field":[
  {"vacant":false,"player":{"id":44,"name":"cez","racket":{"x":1.5},"action":{"direction":"none"}}},
  {"vacant":true},{"vacant":true},{"vacant":true}
],"timestamp":2010}
```

Move

```JSON
{"event":"move","player_id":2,"x":2.514,"direction":"right"}
{"event":"move","player_id":2,"x":3.5469999999999997,"direction":"left"}
{"event":"move","player_id":2,"x":4,"direction":"none"}
```

Collision

```JSON
{"event":"collision","ball":{"id":98688055,"position":{"x":0.7666666625784746,"y":2.2666666666666555},"linearVelocity":{"x":-5.000000000000001,"y":-1.999999999999995},"last_player_id":44},"timestamp":2188}

