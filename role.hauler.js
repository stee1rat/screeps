let customFunctions = require('custom.functions');

let roleHauler = {

  run: function(creep) {
    if (creep.carry.energy === 0) {
      if (creep.getEnergy() === null) {
        customFunctions.park(creep);
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
