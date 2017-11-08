module.exports = { // role defender
  run: function(creep) {
    let hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length) {
      if (creep.attack(hostiles[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(hostiles[0]);
      }
    } else {
      _.each(_.filter(Game.flags, f => f.memory.defend), flag => {
        if (!creep.pos.isNearTo(flag)) {
          creep.moveTo(flag.pos, {reusePath: 10});
          return;        
        }
      });
    }
  }
};
