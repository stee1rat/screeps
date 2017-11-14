// Role upgrader
// Implementation using the state machine according to the following tutorial
// https://screepsworld.com/2017/09/screeps-tutorial-handling-creep-roles-with-a-state-machine/

const STATE_SPAWNING = 0;
const STATE_MOVING = 1;
const STATE_HARVESTING = 2;
const STATE_UPGRADING = 3;

module.exports = {
  run(creep) {
    if(!creep.memory.state) {
      creep.memory.state = STATE_SPAWNING;
    }
    switch(creep.memory.state) {
      case STATE_SPAWNING:
        this.runSpawning(creep);
        break;
      case STATE_MOVING:
        this.runMoving(creep);
        break;
      case STATE_HARVESTING:
        this.runHarvesting(creep);
        break;
      case STATE_FIND_ENERGY_SOURCE:
        this.findEnergySource(creep);
        break;
      /*case STATE_UPGRADING:
        this.runUpgrading(creep);
        break;*/
    }
  },
  runSpawning(creep) {
    if(!creep.spawning) {
      creep.memory.state = STATE_HARVESTING;
      this.run(creep);
      return;
    }
    if (!creep.memory.init) {
      creep.memory.controller = creep.room.controller.id;
      creep.memory.init = true;
    }
  },
  runHarvesting(creep) {
    if (!creep.memory.source) {
      creep.memory.source = this.findEnergySource(creep);
    }
  },
  findEnergySource(creep) {
    const roomMemory = Memory.rooms[creep.room.name];

    let source = null;

    // look for available dropped energy
    if (roomMemory.droppedEnergy.length) {
      //const energy = _.map(Memory.droppedEnergy, e => Game.getObjectById(e));
      const energyAvailable = _.filter(roomMemory.droppedEnergy, function(e) {
        // find all creeps that have this energy as a source
        const creeps = _.filter(Game.creeps, c => c.memory.source == e);
        // how much of this energy they will pick up
        const amount = _.sum(creeps, c => c.carryCapacity - _.sum(c.carry));
        const energy = Game.getObjectById(e);
        return (energy.amount - amount) > 0
      });

      if (energyAvailable.length) {
        source = creep.pos.findClosestByPath(energyAvailable);
      }
    }
    // take energy from container or storage, whichever is closer
    if (!source) {
      let containersAndStorage = [];
      if (roomMemory.containers.length) {
        let containers = _.map(roomMemory.containers, e => Game.getObjectById(e));
        let availableContainers = _.filter(containers, x =>
          x.store[RESOURCE_ENERGY] - _.sum(_.map(Game.creeps, c =>
            //(c.memory.role == 'hauler' && c.memory.source == x.id &&
            (c.memory.source == x.id &&
             Game.getObjectById(c.memory.source)) &&
             c.carryCapacity || 0)) > 0
        );
        if (availableContainers) {
            containersAndStorage = containersAndStorage.concat(availableContainers);
        }
      }
      if (roomMemory.storageID) {
        let storage = Game.getObjectById(Memory.storageID);
        if (storage.store[RESOURCE_ENERGY] > 0) {
          containersAndStorage = containersAndStorage.concat(storage);
        }
      }
      if (containersAndStorage.length) {
        source = creep.pos.findClosestByPath(containersAndStorage);
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
};
