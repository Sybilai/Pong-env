function Edge(vacant, player) {
  this.vacant = !!vacant;
  if ( !vacant ) {
    this.player = player;
  }
}

module.exports = Edge;
