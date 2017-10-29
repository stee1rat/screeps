let customFunctions = require('custom.functions');

let roleBuilder = {

  run: function(creep) {
    if (creep.carry.energy == creep.carryCapacity) {
      creep.memory.harvesting = false
    };

    if (creep.carry.energy == 0 || creep.memory.harvesting) {
      creep.getEnergy();    
    }
    else {
      // First build containers
      let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES,
          { filter: construction =>
              construction.structureType == STRUCTURE_CONTAINER }
      );

      if (target != null) {
        if (creep.build(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: {stroke: '#ffffff'},
              reusePath: 5
          });
        }
      } else {
        // Then everything else
        let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        if (target != null) {
          if (creep.build(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {
                visualizePathStyle: {stroke: '#ffffff'},
                reusePath: 5
            });
          }
        } else {
          customFunctions.park(creep);
        }
      }
    }
	}

};

module.exports = roleBuilder;
