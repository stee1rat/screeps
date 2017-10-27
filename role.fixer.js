var roleFixer = {
    run: function(creep) {
      if (creep.carry.energy == 0 || creep.memory.harvesting) {
        var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE)
        var harvest = creep.harvest(source)

        if (harvest == ERR_NOT_IN_RANGE)
          creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}})

        if (harvest == OK)
          creep.memory.harvesting = true

        if (creep.carry.energy == creep.carryCapacity)
          creep.memory.harvesting = false
        }
        else {
          if (!creep.memory.repairTaget) {
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: structure => structure.hits < structure.hitsMax * 0.7
            })

            if (target) {
              creep.memory.repairTaget = target.id
            }
          } else {
            var target = Game.getObjectById(creep.memory.repairTaget)
            if (target.hits == target.hitsMax) {
              creep.memory.repairTaget = null
            } else {
              if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
              }
            }
          }
        }
      }
};

module.exports = roleFixer;
