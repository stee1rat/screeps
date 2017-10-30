let roleHauler = {

  run: function(creep) {
    if (creep.carry.energy === 0) {
      creep.getEnergy();
    } else {
      let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (structure) => {
              return (structure.structureType == STRUCTURE_SPAWN ||
                      structure.structureType == STRUCTURE_EXTENSION ||
                      structure.structureType == STRUCTURE_TOWER) &&
                  structure.energy < structure.energyCapacity;
          }
      });
      if (target === null) {
        console.log('lets find storage');
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_STORAGE &&
                    structure.store < structure.storeCapacity
            }
        });
        console.log(target);
      }
      if (target !== null) {
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
      }
    }
	}
};

module.exports = roleHauler;
