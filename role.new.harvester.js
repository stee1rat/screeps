let roleHarvester2 = {

  run: function(creep) {
    if (creep.spawning) {
      if (!creep.memory.init) {
        // find how many harvesters are on each source in the room
        let sourcesList = creep.room.find(FIND_SOURCES);
        let sources = {};
        for (i = 0; i < sourcesList; i++) {
          sources[sourcesList[i].id] = 0;
        }
        for (let name in Game.creeps) {
          let creep = Game.creeps[name];
          if (creep.memory.role == 'harvester') {
            if (!sources[creep.memory.targetSource]) {
              sources[creep.memory.targetSource] = 0;
            } else {
              sources[creep.memory.targetSource]++;
            }
          }
        }
        let targetSource = '';
        for (let key in sources) {
          if (sources.hasOwnProperty(key)) {
            if (targetSource == '' || sources[key] < targetSource) {
              targetSource = key;
            }
          }
        }
        creep.memory.targetSource = targetSource;
        creep.memory.init = true;
      }
      return;
    }
    console.log(creep.memory.targetSource)
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
