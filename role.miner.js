var roleMiner = {
  run: function(creep, customFunctions) {
    if (creep.memory.assignedContainer == []._) {
      let containers = creep.room.find(FIND_STRUCTURES, {
        filter: structure =>
          structure.structureType == STRUCTURE_CONTAINER &&
          Memory.containers.indexOf(structure.id) == -1
      });
      if (containers.length) {
        Memory.containers.push(containers[0].id);
        creep.memory.assignedContainer = containers[0].id;
      } else {
        customFunctions.park(creep);
      }
    } else {
      let container = Game.getObjectById(creep.memory.assignedContainer);
      if (!creep.memory.inPosition) {
        if (!creep.pos.isEqualTo(container)) {
          creep.moveTo(container);
        } else {
          creep.memory.inPosition = true;
          creep.memory.assignedSource =
              creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE).id;
        }
      } else {
        if (creep.memory.assignedSource == []._) {
          creep.memory.assignedSource =
              creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE).id;
        }
        let source = Game.getObjectById(creep.memory.assignedSource);
        console.log(creep.harvest(source));
      }
    }
  }
};
module.exports = roleMiner;
