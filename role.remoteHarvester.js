let roleRemoteHarvester = {

  run: function(creep) {
    if (creep.spawning || !creep.memory.init ) {
      // assign to a room
      if (!creep.memory.room) {
        let flag = _.map(Game.flags, f => f)
        //creep.memory.roomName = flag[0].pos.roomName;
        creep.memory.flagName = flag[0].name;
      }
      creep.memory.init = true;
      return;
    }
    console.log(creep.pos.roomName, Game.flags[creep.memory.flagName].pos.roomName)
    if (creep.pos.roomName != Game.flags[creep.memory.flagName].pos.roomName) {
      // workaround for the jumps between rooms
      if(creep.pos.x*creep.pos.y === 0 || creep.pos.x === 49 || creep.pos.y === 49) {
        creep.moveTo(new RoomPosition(25,25,creep.memory.workInRoom));
      } else {
        creep.moveTo(Game.flags[creep.memory.flagName].pos);
      }
    } else {
      //if (creep.pos != ('29,38')){
        creep.move(RIGHT);
      //}
      console.log('WOOOOW');
      let sources = creep.room.find(FIND_SOURCES);
      for (let i = 0; i < sources.length; i++) {
        console.log(sources.id);
          //creep.memory.source = sources.id;
      }
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
      if (!creep.memory.target) {
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
          creep.memory.target = null;
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
