var roleMiner = {

  /** @param {Creep} creep **/

  run: function(creep) {

    if (!creep.memory.inPosition) {
      let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
              filter: structure =>
                  structure.structureType == STRUCTURE_CONTAINER &&
                  structure.store[RESOURCE_ENERGY] == 0
      })
      if (!creep.pos.isEqualTo(container)) {
        creep.moveTo(container);
      } else {
        creep.memory.inPosition = true;
        creep.memory.miningSourceId = creep.pos.findClosestByPath(FIND_SOURCES).id
      }
    } else {
      let source = Game.getObjectById(creep.memory.miningSourceId);
      creep.harvest(source);      
    }
  }
};

module.exports = roleMiner;
