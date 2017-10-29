let customFunctions = require('custom.functions');

let roleHauler = {

  run: function(creep) {
    if (creep.carry.energy === 0) {
      // First the haulers look for dropped energy
      let source = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES,
          { filter: resource => resource.resourceType == RESOURCE_ENERGY }
      );

      if (source !== null) {
        let withdraw = creep.pickup(source);
        if (withdraw == ERR_NOT_IN_RANGE) {
          creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
      } else {
        // If no dropped energy lets widthdraw from container
        let source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: structure =>
                structure.structureType == STRUCTURE_CONTAINER &&
                structure.store[RESOURCE_ENERGY] > 0
        });

        // If nothing found at all hauler parks
        if (source === null) {
          customFunctions.park(creep);
        }

        let withdraw = creep.withdraw(source, RESOURCE_ENERGY);
        if (withdraw == ERR_NOT_IN_RANGE) {
          creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
      }
    } else {
      let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (structure) => {
              return (structure.structureType == STRUCTURE_SPAWN ||
                      structure.structureType == STRUCTURE_EXTENSION ||
                      structure.structureType == STRUCTURE_TOWER) &&
                  structure.energy < structure.energyCapacity;
          }
      });

      if (target !== null) {
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
      }
    }
	}
};

module.exports = roleHauler;
