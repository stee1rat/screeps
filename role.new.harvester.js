let roleHarvester2 = {

  run: function(creep) {
    if (creep.spawning) {
      if (!creep.memory.init) {
        // assign to a source
        let sources = creep.room.find(FIND_SOURCES);
        for (let i = 0; i < sources.length; i++) {
          let source = creep.room.find(FIND_MY_CREEPS, {
            filter: c => c.memory.source == s.id
          });
           // Assign 3 (0, 1, 2) creeps per source
          if(!source || source.length <= 2) {
            creep.memory.source = source.id;
          }
        }
        creep.memory.init = true;
      }
      return;
    }
    console.log(creep.memory.source);
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

module.exports = roleHarvester2;
