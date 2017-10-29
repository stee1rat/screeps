var roleMiner = {

  run: function(creep, customFunctions) {
    if (creep.memory.source == []._) {
      let sources = creep.room.find(FIND_SOURCES, {
        filter: source => Memory.sources.indexOf(source.id) == -1
      });

      if (sources.length) {
        Memory.sources.push(sources[0].id);
        creep.memory.source = sources[0].id;
      } else {
        customFunctions.park(creep);
      }
    } else {
      let source = Game.getObjectById(creep.memory.source);

      if (!creep.memory.inPosition) {
        if (!creep.pos.isNearTo(source)) {
          creep.moveTo(source);
        } else {
          creep.memory.inPosition = true;
        }
      } else {
        creep.harvest(source);
      }
    }
  }
};

module.exports = roleMiner;
