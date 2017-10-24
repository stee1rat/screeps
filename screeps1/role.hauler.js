var roleHauler = {

    /** @param {Creep} creep **/
    run: function(creep) {
      if (creep.carry.energy == 0) {
        var source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: structure =>
                    structure.structureType == STRUCTURE_CONTAINER &&
                    structure.store[RESOURCE_ENERGY] > 0
        })

        var withdraw = creep.withdraw(source, RESOURCE_ENERGY)

        if (withdraw == ERR_NOT_IN_RANGE) {
          creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}})
        }
      } else {
        var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                  filter: (structure) => {
                      return (structure.structureType == STRUCTURE_SPAWN ||
                              structure.structureType == STRUCTURE_EXTENSION) &&
                          structure.energy < structure.energyCapacity;
                  }
        })

        if (target != null) {
          if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
              creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
          }
        }
      }
	}
};

module.exports = roleHauler;
