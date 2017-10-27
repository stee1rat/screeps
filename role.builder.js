var roleBuilder = {

  run: function(creep, customFunctions) {
    if (creep.carry.energy == 0 || creep.memory.harvesting) {
      let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      let harvest = creep.harvest(source)
      if (harvest == ERR_NOT_IN_RANGE)
        creep.moveTo(source, {
            visualizePathStyle: {stroke: '#ffaa00'},
            reusePath: 5
        });
      if (harvest == OK) {
        creep.memory.harvesting = true
      }
      if (creep.carry.energy == creep.carryCapacity) {
        creep.memory.harvesting = false
      }
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
