// Role upgrader
// Implementation using the state machine according to the following tutorial
// https://screepsworld.com/2017/09/screeps-tutorial-handling-creep-roles-with-a-state-machine/

const STATE_SPAWNING = 0;
const STATE_HARVESTING = 1;
const STATE_UPGRADING = 2;

module.exports = {
  run: function(creep) {
    if(!creep.memory.state) {
      creep.memory.state = STATE_SPAWNING;
    }
    switch(creep.memory.state) {
      case STATE_SPAWNING:
        this.runSpawning(creep);
        break;
      case STATE_UPGRADING:
        this.runUpgrading(creep);
        break;
      case STATE_HARVESTING:
        this.runHarvesting(creep);
        break;
    }
  },
  moveTo: function(creep, target) {
    creep.moveTo(target, {
      visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5
    });
  },
  runSpawning: function(creep) {
    if (!creep.memory.init) {
      creep.memory.controller = creep.room.controller.id;
      creep.memory.init = true;
    }
    if(!creep.spawning) {
      creep.memory.state = STATE_UPGRADING;
      this.run(creep);
      return;
    }
  },
  runUpgrading: function(creep) {
    if (creep.carry.energy === 0) {
      creep.memory.state = STATE_HARVESTING;
      this.run(creep);
      return;
    }
    const controller = Game.getObjectById(creep.memory.controller);
    const result = creep.upgradeController(controller);
    if (result == ERR_NOT_IN_RANGE) {
      this.moveTo(creep, controller);
    }
  },
  runHarvesting: function(creep) {
    if (!creep.memory.source) {
      this.findEnergySource(creep);
    }
    if (creep.memory.source === null) {
      return;
    }
    const source = Game.getObjectById(creep.memory.source);

    let result;
    if (source.resourceType) {
      result = creep.pickup(source);
    }
    if (source.structureType)  {
      result = creep.withdraw(source, RESOURCE_ENERGY);
    }
    if (source.ticksToRegeneration) {
      result = creep.harvest(source);
    }
    if (result == ERR_NOT_ENOUGH_RESOURCES) {
      creep.memory.source = false;
      this.run(creep);
      return;
    }
    if (result == ERR_NOT_IN_RANGE) {
      this.moveTo(creep, source);
    }
    if (creep.carry.energy == creep.carryCapacity) {
      delete creep.memory.source;
      creep.memory.state = STATE_UPGRADING;
      this.run(creep);
      return;
    }
  },
  findEnergySource: function(creep) {
    const roomMemory = Memory.rooms[creep.room.name];
    // look for available dropped energy
    if (roomMemory.droppedEnergy.length) {
      const energyAvailable = _.filter(roomMemory.droppedEnergy, function(e) {
        // find all creeps that have this energy as a source
        const creeps = _.filter(Game.creeps, c => c.memory.source == e);
        // how much of this energy they will pick up
        const amount = _.sum(creeps, c => c.carryCapacity - _.sum(c.carry));
        const energy = Game.getObjectById(e);
        return (energy.amount - amount) > 0;
      });
      if (energyAvailable.length) {
        const energy = _.map(energyAvailable, e => Game.getObjectById(e));
        source = creep.pos.findClosestByPath(energy);
        if (source !== null) {
            creep.memory.source = source.id;
        }
        return;
      }
    }
    let containersAndStorage = [];
    if (roomMemory.containers.length) {
      let containers = _.map(roomMemory.containers, e => Game.getObjectById(e));
      let availableContainers = _.filter(containers, x =>
        x.store[RESOURCE_ENERGY] - _.sum(_.map(Game.creeps, c =>
          (c.memory.source == x.id &&
           Game.getObjectById(c.memory.source)) &&
           c.carryCapacity || 0)) > 0
      );
      if (availableContainers) {
          containersAndStorage = containersAndStorage.concat(availableContainers);
      }
    }
    if (roomMemory.storageID) {
      let storage = Game.getObjectById(roomMemory.storageID);
      if (storage.store[RESOURCE_ENERGY] > 0) {
        containersAndStorage = containersAndStorage.concat(storage);
      }
    }
    if (containersAndStorage.length) {
      const source = creep.pos.findClosestByPath(containersAndStorage);
      creep.memory.source = source.id;
      return;
    }
    if (creep.getActiveBodyparts(WORK) > 0) {
      const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      if (source !== null) {
        creep.memory.source = source.id;
        return;
      }
    }
  }
};
