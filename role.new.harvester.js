let roleRemoteHarvester = {

  run: function(creep) {
    if (creep.spawning || !creep.memory.init ) {
      // assign to a source
      if (!creep.memory.home) {
        creep.memory.home = creep.room.name;
      }
      let homeRoom = Game.rooms[creep.memory.home];
      let sources = homeRoom.find(FIND_SOURCES);

      for (let i = 0; i < sources.length; i++) {
        let source = homeRoom.find(FIND_MY_CREEPS, {
          filter: c => c.memory.source == sources[i].id
        });
        // assign 2 (0, 1) creeps per source
        if(source === null || source.length <= 1) {
          creep.memory.source = sources[i].id;
        }
      }
      creep.memory.init = true;
      return;
    }
    if (creep.carry.energy === 0 || creep.memory.harvesting) {
      if (!creep.memory.source) {
        creep.memory.init = false;
        return;
      }
      let source = Game.getObjectById(creep.memory.source);
      let harvest = creep.harvest(source);
      if (harvest == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, {
            visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5
        });
      }
      if (harvest == OK) {
        creep.memory.harvesting = true;
      }
      if (creep.carry.energy == creep.carryCapacity) {
        creep.memory.harvesting = false;
      }
    } else {
      // refills needed for spawn and extentions
      if (!creep.memory.target) {
        let target;

        let targetsToRefill = _.map(
          Memory.rooms[creep.memory.home].targetsToRefill, x =>
            Game.getObjectById(x)
        );

        let spawn = _.filter(targetsToRefill, s =>
          (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) &&
          s.energy < s.energyCapacity && !_.some(Game.creeps, c => c.memory.targetID == s.id));

        if (spawn.length) {
          target = creep.pos.findClosestByPath(spawn);
        }

        // refills needed for towers
        if (!target) {
          let towers = _.filter(targetsToRefill, s =>
            s.structureType == STRUCTURE_TOWER && s.energy <= s.energyCapacity/2 &&
            !_.some(Game.creeps, c => c.memory.targetID == s.id));

          if (towers.length) {
            target = creep.pos.findClosestByPath(towers);
          }
        }

        // drop energy to a storage
        if (!target && Memory.rooms[creep.memory.home].storageID) {
          let storage = Game.getObjectById(Memory.rooms[creep.memory.home].storageID);
          if (_.sum(storage.store) < storage.storeCapacity) {
            target = storage;
          }
        }

        if (target) creep.memory.target = target.id;
      }
      let target = Game.getObjectById(creep.memory.target);
      if (target !== null) {
        if (((target.structureType == STRUCTURE_SPAWN ||
              target.structureType == STRUCTURE_EXTENSION) &&
              target.energy == target.energyCapacity) ||
            ((target.structureType == STRUCTURE_STORAGE ||
              target.structureType == STRUCTURE_CONTAINER) &&
              _.sum(target.store) == target.storeCapacity))  {
          //creep.memory.target = null;
          delete creep.memory.target;
          return;
        }
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

module.exports = roleRemoteHarvester;
