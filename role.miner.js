let roleMiner = {
  run: function(creep) {
    if (creep.spawning || !creep.memory.init ) {
      // assign to a source
      let sources = creep.room.find(FIND_SOURCES);
      let sourcesLength = sources.length;
      for (let i = 0; i < sourcesLength; i++) {
        let miners = creep.room.find(FIND_MY_CREEPS, {
          filter: c => c.memory.source == sources[i].id &&
                       c.memory.role == 'miner'
        });
        // 1 miner per source
        if (!miners.length) {
          creep.memory.source = sources[i].id;
        }
      }
      creep.memory.init = true;
      return;
    }
    if (!creep.memory.source) {
      creep.memory.init = false;
    }
    if (creep.memory.source) {
      let source = Game.getObjectById(creep.memory.source);

      if (!creep.memory.inPosition) {
        if (!creep.pos.isNearTo(source)) {
          creep.moveTo(source);
        } else {
          creep.memory.inPosition = true;
        }
      } else {
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
         creep.memory.inPosition = false;
       }
      }
    }
  }
};

module.exports = roleMiner;
