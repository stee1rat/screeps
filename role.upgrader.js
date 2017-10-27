var roleUpgrader = {
  run: function(creep) {
    if (creep.memory.upgrading && creep.carry.energy == 0) {
      creep.memory.upgrading = false;
      creep.say('harvest');
    }
    if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
      creep.memory.upgrading = true;
      creep.say('upgrade');
    }
    if (creep.memory.upgrading) {
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {
            visualizePathStyle: {stroke: '#ffffff'},
            reusePath: 5
        });
      }
    } else {
      var source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
              filter: structure =>
                  structure.structureType == STRUCTURE_CONTAINER &&
                  structure.store[RESOURCE_ENERGY] > 0
      })
      if (source != null) {
        var withdraw = creep.withdraw(source, RESOURCE_ENERGY)
        if (withdraw == ERR_NOT_IN_RANGE) {
          creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}})
        }
      } else {
        var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
          creep.moveTo(source, {
              visualizePathStyle: {stroke: '#ffaa00'},
              reusePath: 5
          });
        }
      }
    }
	}
};

module.exports = roleUpgrader;
