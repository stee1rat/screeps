let customFunctions = require('custom.functions');

let roleBuilder = {

  run: function(creep, ) {
    if (creep.carry.energy == creep.carryCapacity) {
      creep.memory.harvesting = false
    };

    if (creep.carry.energy == 0 || creep.memory.harvesting) {
      // First look for dropped energy
      let source = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES,
          { filter: resource => resource.resourceType == RESOURCE_ENERGY }
      );

      if (source !== null) {
        let withdraw = creep.pickup(source);
        if (withdraw == ERR_NOT_IN_RANGE) {
          creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
      } else {
        let source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: structure =>
                structure.structureType == STRUCTURE_CONTAINER &&
                structure.store[RESOURCE_ENERGY] > 0
        });

        // If nothing found at
        if (source === null) {
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
        }

        let withdraw = creep.withdraw(source, RESOURCE_ENERGY);
        if (withdraw == ERR_NOT_IN_RANGE) {
          creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
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
