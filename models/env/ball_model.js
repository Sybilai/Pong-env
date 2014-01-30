function Ball() {
  this.id = Date.now() % 100000000;

  this.position = {};
  this.linearVelocity = {};

  this.last_player_id = 0;
}

module.exports = Ball;
