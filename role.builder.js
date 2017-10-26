var roleBuilder = {

  customFunctions = require('custom.functions');

  run: function(creep) {
    if (creep.carry.energy == 0 || creep.memory.harvesting) {
      let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      let harvest = creep.harvest(source)

      if (harvest == ERR_NOT_IN_RANGE)
        creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});

      if (harvest == OK)
        creep.memory.harvesting = true

      if (creep.carry.energy == creep.carryCapacity)
        creep.memory.harvesting = false
    }
    else {
      let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
      if (target != null) {
        if (creep.build(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
      } else {
        customFunctions.park(creep);
      }
    }
	}

};

module.exports = roleBuilder;
