// Role upgrader
// Implementation using the state machine according to the following tutorial
// https://screepsworld.com/2017/09/screeps-tutorial-handling-creep-roles-with-a-state-machine/

const STATE_SPAWNING = 0;
const STATE_HARVESTING = 2;
const STATE_UPGRADING = 3;

module.exports = {
  run: function(creep) {
    creep.say(':D');

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
    if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
      this.moveTo(creep, controller);
    }
  },
  runHarvesting: function(creep) {
    if (!creep.memory.source) {
      this.findEnergySource(creep);
    }
    const source = Game.getObjectById(creep.memory.source);
    if (!source) {
      // if the source no longer exists (has been picked up), find another one
      creep.memory.source = false;
      this.run(creep);
      return;
    }
    let result;
    if (source.resourceType) {
      result = creep.pickup(source);
      if (result) {
        console.log('GOT DROPPED ENERGY');
      }
    }
    if (source.structureType)  {
      result = creep.withdraw(source, RESOURCE_ENERGY);
      if (result) {
        console.log('GOT ENERGY FROM ' + source.structureType);
      }
    }
    if (source.ticksToRegeneration) {
      result = creep.harvest(source);
      if (result) {
        console.log('GOT ENERGY FROM SOURCE');
      }
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
    console.log('UPGRADER2 SEARCH ROOM:' + creep.room.name);
    // look for available dropped energy
    if (roomMemory.droppedEnergy.length) {
      const energyAvailable = _.filter(roomMemory.droppedEnergy, function(e) {
        // find all creeps that have this energy as a source
        const creeps = _.filter(Game.creeps, c => c.memory.source == e);
        // how much of this energy they will pick up
        const amount = _.sum(creeps, c => c.carryCapacity - _.sum(c.carry));
        const energy = Game.getObjectById(e);
        return (energy.amount - amount) > 0
      });
      console.log('  energyAvailable.length:' + energyAvailable.length)
      if (energyAvailable.length) {
        const energy = _.map(energyAvailable, e => Game.getObjectById(e));
        source = creep.pos.findClosestByPath(energy);
        creep.memory.source = source.id;
        return;
      }
    }
    // take energy from container or storage, whichever is closer
    let containersAndStorage = [];
    if (roomMemory.containers.length) {
      let containers = _.map(roomMemory.containers, e => Game.getObjectById(e));
      let availableContainers = _.filter(containers, x =>
        x.store[RESOURCE_ENERGY] - _.sum(_.map(Game.creeps, c =>
          (c.memory.source == x.id &&
           Game.getObjectById(c.memory.source)) &&
           c.carryCapacity || 0)) > 0
      );
      console.log('  availableContainers: ' + availableContainers)
      if (availableContainers) {
          containersAndStorage = containersAndStorage.concat(availableContainers);
      }
    }
    if (roomMemory.storageID) {
      let storage = Game.getObjectById(roomMemory.storageID);
      console.log('  storage: ' + storage)
      console.log('  storage.store: ' + storage.store[RESOURCE_ENERGY])

      if (storage.store[RESOURCE_ENERGY] > 0) {
        containersAndStorage = containersAndStorage.concat(storage);
      }
    }
    console.log('  containersAndStorage: ' + containersAndStorage)
    if (containersAndStorage.length) {
      console.log('!!!' + containersAndStorage);
      const source = creep.pos.findClosestByPath(containersAndStorage);
      console.log(JSON.stringify(source))
      creep.memory.source = source.id;
      return;
    }
    if (creep.getActiveBodyparts(WORK) > 0) {
      const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      if (source) {
        creep.memory.source = source.id;
        return;
      }
    }
  }
};
