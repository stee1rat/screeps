let roleUpgrader = {

  run: function(creep) {
    if (creep.spawning || !creep.memory.init ) {
      creep.memory.init = true;
      return;
    }
    if (creep.memory.upgrading && creep.carry.energy == 0) {
      creep.memory.upgrading = false;
      creep.say('harvest');
    }
    if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
      creep.memory.upgrading = true;
      creep.memory.source = null;
      creep.say('upgrade');
    }
    if (creep.memory.upgrading) {
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {
            visualizePathStyle: {stroke: '#ffffff'},
            reusePath: 5
        });
      }
      if (!creep.memory.upgrading && creep.carry.energy < creep.carryCapacity) {
        if (!creep.memory.source) {
          let source = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES,
            { filter: resource => resource.resourceType == RESOURCE_ENERGY }
          );
          if (source === null) {
            source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
              filter: structure =>
                (structure.structureType == STRUCTURE_CONTAINER ||
                 structure.structureType == STRUCTURE_STORAGE) &&
                 structure.store[RESOURCE_ENERGY] > 0
          });
          if (source === null) {
            if (creep.getActiveBodyparts(WORK) > 0) {
              source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            }
          }
          if (source) {
            creep.memory.source = source.id;
          }
        }
        if (creep.memory.source) {
          let source = Game.getObjectById(creep.memory.source);
          // if dropped energy has been pickup up or decayed
          // find another source
          if (!source) {
            creep.memory.source = null;
          }
          // if the source is a dropped energy pick it up
          if (source.resourceType) {
            let pickup = creep.pickup(source);
            if (pickup == ERR_NOT_IN_RANGE) {
              creep.moveTo(source, {
                visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5
              });
            }
          }
          // if the source is storage/container withdraw from it
          if ((source.structureType == STRUCTURE_STORAGE ||
               source.structureType == STRUCTURE_CONTAINER) &&
               source.store[RESOURCE_ENERGY] > 0)  {
            let withdraw = creep.withdraw(source, RESOURCE_ENERGY);
            if (withdraw == ERR_NOT_IN_RANGE) {
              creep.moveTo(source, {
                visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5
              });
            }
          // otherwise it has to be source, so harvest it
          } else {
            let harvest = creep.harvest(source);
            if (harvest == ERR_NOT_IN_RANGE) {
              creep.moveTo(source, {
                  visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5
              });
            }
          }
        }
      }
	  }
  }
};

module.exports = roleUpgrader;
