function Action(x) {
  this.x = x;
  this.timestamp = GameRules.currentTimestamp;
  this.last_time_reported = 0;
}

module.exports = Action;
