let roleHarvester2 = {

  run: function(creep) {
    function getTargetId() {
      let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: structure =>
              (structure.structureType == STRUCTURE_SPAWN ||
               structure.structureType == STRUCTURE_EXTENSION) &&
               structure.energy < structure.energyCapacity
      });

      if (target === null) {
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: structure =>
                (structure.structureType == STRUCTURE_STORAGE ||
                 structure.structureType == STRUCTURE_CONTAINER) &&
                _.sum(structure.store) < structure.storeCapacity
        });
      }

      return target.id || null;
    }

    if (creep.spawning || !creep.memory.init ) {
      // assign to a source
      let sources = creep.room.find(FIND_SOURCES);
      for (let i = 0; i < sources.length; i++) {
        let source = creep.room.find(FIND_MY_CREEPS, {
          filter: c => c.memory.source == sources[i].id
        });
        // assign 3 (0, 1, 2) creeps per source
        if(source === null || source.length <= 2) {
          creep.memory.source = sources[i].id;
        }
      }
      creep.memory.init = true;

      return;
    }

    if (creep.carry.energy === 0 || creep.memory.harvesting) {
      if (!creep.memory.source) {
        creep.memory.init = false;
      }
      let source = Game.getObjectById(creep.memory.source);
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
        creep.memory.target = getTargetId();
      }
    } else {
      let target = Game.getObjectById(creep.memory.target);

      if (((target.structureType == STRUCTURE_SPAWN ||
            target.structureType == STRUCTURE_EXTENSION) &&
            target.energy == target.energyCapacity) ||
          ((target.structureType == STRUCTURE_STORAGE ||
            target.structureType == STRUCTURE_CONTAINER) &&
            _.sum(target.store) == target.storeCapacity))  {
        creep.memory.target = getTargetId();
      }
      if (target !== null) {
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {
              visualizePathStyle: {stroke: '#ffffff'},
              reusePath: 5
          });
        }
      } else {
        creep.memory.harvesting = true;
      }
    }
	}
};

module.exports = roleHarvester2;
