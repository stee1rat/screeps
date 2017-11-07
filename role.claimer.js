let roleClaimer = {
  run: function(creep) {
    if (creep.spawning || !creep.memory.init ) {
      _.each(_.filter(Game.flags, f => f.memory.claim &&
          !_.some(Game.creeps, c => c.memory.flagName == f.name)), flag => {
        creep.memory.flagName = flag.name;
        creep.memory.init = true;
      });
      return;
    }
  }
};

module.exports = roleClaimer;
