function Player( name, id ) {
  this.id = id;
  this.name = name;
  this.paddle = {
    x: 1.5
  };
  this.action = {
    direction: "none"
  }
}

module.exports = Player;
