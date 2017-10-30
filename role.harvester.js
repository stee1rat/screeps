var roleHarvester = {

  run: function(creep) {
    if (creep.carry.energy === 0 || creep.memory.harvesting) {
      let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      let harvest = creep.harvest(source);
      if (harvest == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, {
            visualizePathStyle: {stroke: '#ffaa00'},
            reusePath: 5
        });
      }
      if (harvest == OK) {
        creep.memory.harvesting = true;
      }
      if (creep.carry.energy == creep.carryCapacity) {
        creep.memory.harvesting = false;
      }
    } else {
      let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: structure =>
              (structure.structureType == STRUCTURE_SPAWN ||
               structure.structureType == STRUCTURE_EXTENSION) &&
               structure.energy < structure.energyCapacity
      });
      if (target === null) {
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: structure =>
                structure.structureType == STRUCTURE_STORAGE &&
                _.sum(structure.store) < structure.storeCapacity
        });
      }
      if (target !== null) {
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {
              visualizePathStyle: {stroke: '#ffffff'},
              reusePath: 5
          });
        }
      }
    }
	}
};

module.exports = roleHarvester;
