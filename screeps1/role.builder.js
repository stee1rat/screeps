var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    //if (creep.carry.energy < creep.carryCapacity) {
      if (creep.carry.energy == 0 || creep.memory.harvesting) {
        //var sources = creep.room.find(FIND_SOURCES);
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
          var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
          if (target != null) {
              if (creep.build(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                  creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
              }
          }
      }
	}
};

module.exports = roleBuilder;
