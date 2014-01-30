var Ticker = {
  queue: [],
  garbageTimestamp: 0,
  initialize: function() {
    setTimeout( Ticker.update, 1000 / GameRules.framesPerSecond );
  },

  update: function() {
    ++GameRules.currentTimestamp;

    while (Ticker.queue.length) {
      Ticker.queue.shift()();
    }

    Engine.update();

    if (GameRules.currentTimestamp - Ticker.garbageTimestamp > 60 * GameRules.framesPerSecond) {
      console.log('Garbage Collected Clean');
//      global.gc();
      Ticker.garbageTimestamp = GameRules.currentTimestamp;
    }

    setTimeout( Ticker.update, 1000 / GameRules.framesPerSecond );
  }

};

module.exports = Ticker;
