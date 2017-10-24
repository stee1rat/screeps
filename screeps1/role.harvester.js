var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
      if (creep.carry.energy == 0 || creep.memory.harvesting) {
        var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
        var harvest = creep.harvest(source)

        if (harvest == ERR_NOT_IN_RANGE)
          creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});

        if (harvest == OK)
          creep.memory.harvesting = true

        if (creep.carry.energy == creep.carryCapacity)
          creep.memory.harvesting = false
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_EXTENSION) &&
                            structure.energy < structure.energyCapacity;
                    }
            });

            if (targets.length > 0) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
              var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
              if (targets.length > 0) {
                  if (creep.build(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                      creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                  }
              }
            }
        }
	}
};

module.exports = roleHarvester;
