/* jshint esversion: 6 */

let roleUpgrader = {

  run: function(creep) {
    var startCpu = Game.cpu.getUsed();
    if (creep.spawning || !creep.memory.init ) {
      creep.memory.init = true;
      return;
    }
    if (creep.memory.upgrading && creep.carry.energy === 0) {
      creep.memory.upgrading = false;
      creep.say('harvest');
    }
    if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
      creep.memory.upgrading = true;
      creep.memory.source = null;
      creep.say('upgrade');
    }
    if (creep.memory.upgrading) {
      var upgradeCpu = Game.cpu.getUsed();
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {
            visualizePathStyle: {stroke: '#ffffff'}, reusePath: 5
        });
        //console.log('MOVE TO CONTROLLER: ' + (Game.cpu.getUsed() - startCpu ));
      } else {
        //console.log('UPGARDE: ' + (Game.cpu.getUsed() - startCpu ));
      }
    }
    if (!creep.memory.upgrading && creep.carry.energy < creep.carryCapacity) {
      if (!creep.memory.source) {
        let source = null;

        // look for available dropped energy
        if (Memory.droppedEnergy.length) {
          let droppedEnergy = _.map(Memory.droppedEnergy, e => Game.getObjectById(e));
          let availableEnergy = _.filter(droppedEnergy, e =>
            e.amount - _.sum(_.map(Game.creeps, c =>
              //(c.memory.role == 'hauler' && c.memory.source == e.id &&
              (c.memory.source == e.id &&
               Game.getObjectById(c.memory.source)) &&
               c.carryCapacity || 0)) > 0
          );
          if (availableEnergy) {
            source = creep.pos.findClosestByPath(availableEnergy);
          }
        }
        // look for avaiable energy in containers
        // containers with more energy are prefered
        if (!source && Memory.containers.length) {
          let containers = _.map(Memory.containers, e => Game.getObjectById(e));
          let availableContainers = _.filter(containers, x =>
            x.store[RESOURCE_ENERGY] - _.sum(_.map(Game.creeps, c =>
              //(c.memory.role == 'hauler' && c.memory.source == x.id &&
              (c.memory.source == x.id &&
               Game.getObjectById(c.memory.source)) &&
               c.carryCapacity || 0)) > 0
          );
          if (availableContainers) {
            source = availableContainers.sort((a, b) =>
              b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY])[0];
          }
        }
        // if there are no other energy sources get it from storage
        if (!source && Memory.storageID) {
          let storage = Game.getObjectById(Memory.storageID);
          if (storage.store[RESOURCE_ENERGY] > 0) {
            source = storage;
          }
        }
        // if everything is empty, lets go mining
        if (!source) {
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
          return;
        }
        // if the source is a dropped energy then pick it up
        if (source.resourceType) {
          let pickup = creep.pickup(source);
          if (pickup == ERR_NOT_IN_RANGE) {
            creep.moveTo(source, {
              visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5
            });
          }
        }
        // if the source is a storage/container withdraw from it
        if ((source.structureType == STRUCTURE_STORAGE ||
             source.structureType == STRUCTURE_CONTAINER) &&
             source.store[RESOURCE_ENERGY] > 0)  {
          let withdraw = creep.withdraw(source, RESOURCE_ENERGY);
          if (withdraw == ERR_NOT_IN_RANGE) {
            creep.moveTo(source, {
              visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5
            });
          }
        // otherwise it has to be a source, so harvest it
        } else {
          if (source.structureType) {
            creep.memory.source = null;
            return;
          }
          let harvest = creep.harvest(source);
          if (harvest == ERR_NOT_IN_RANGE) {
            creep.moveTo(source, {
                visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5
            });
          }
        }
      }
    }
    //console.log( 'FULL CPU: ' + (Game.cpu.getUsed() - startCpu ));
  }
};

module.exports = roleUpgrader;
