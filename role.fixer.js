var roleFixer = {

  run: function(creep) {
    if (creep.spawning || !creep.memory.init ) {
      if (!creep.memory.home) {
        creep.memory.home = creep.room.name;
      }
      creep.memory.init = true;
      return;
    }
    if (creep.carry.energy === 0 || creep.memory.harvesting) {
      creep.getEnergy();
      /*let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      let harvest = creep.harvest(source);

      if (harvest == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
      }

      if (harvest == OK) {
        creep.memory.harvesting = true;
      }

      if (creep.carry.energy == creep.carryCapacity) {
        creep.memory.harvesting = false;
      }*/
    } else {
      if (!creep.memory.repairTaget) {
        let targets = Game.rooms[creep.memory.home].find(FIND_STRUCTURES, {
            filter: structure => structure.hits < structure.hitsMax * 0.7 &&
              structure.hits < 50000
        });
        if (targets.length > 0) {
          let target = creep.pos.findClosestByPath(targets);
          if (target) {
            creep.memory.repairTaget = target.id;
          }
        }
      } else {
        let target = Game.getObjectById(creep.memory.repairTaget);

        if (target == []._) {
          creep.memory.repairTaget = 0;
        } else {
          if (target.hits == target.hitsMax || target.hits > 50000) {
            creep.memory.repairTaget = null;
          } else {
            if (creep.repair(target) == ERR_NOT_IN_RANGE) {
              creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
          }
        }
      }
    }
  }
};

module.exports = roleFixer;
