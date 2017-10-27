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
        }
      } else {
        console.log(container);
        //let source = Game.getObjectById(creep.memory.assignedContainer);
        //let storageContainer = Game.getObjectById(creep.memory.storageContainerId);
        //if (storageContainer.store[RESOURCE_ENERGY] < storageContainer.storeCapacitynumber) {
        console.log(creep.harvest(container));
      }
    }
  }
};
module.exports = roleMiner;
