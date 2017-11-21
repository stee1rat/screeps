module.exports ={ // Role hauler

  run: function(creep) {
    if (creep.spawning) {
      if (!creep.memory.home) {
        creep.memory.home = creep.room.name;
      }
      return;
    }
    if (creep.carry.energy === 0) {
      if (!creep.memory.source) {
        if (!creep.memory.home) {
          creep.memory.init = false;
          return;
        }
        let source = null;
        let homeRoom = creep.memory.home;

        // look for available dropped energy
        if (Memory.rooms[homeRoom].droppedEnergy.length) {
          let droppedEnergy = _.map(Memory.rooms[homeRoom].droppedEnergy,
            e => Game.getObjectById(e));

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
        if (!source && Memory.rooms[homeRoom].containers.length) {
          let containers = _.map(Memory.rooms[homeRoom].containers,
            e => Game.getObjectById(e));
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
        if (!source && Memory.rooms[homeRoom].storageID) {
          let storage = Game.getObjectById(Memory.rooms[homeRoom].storageID);
          if (storage.store[RESOURCE_ENERGY] > 0) {
            source = storage;
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

        // if the source is a dropped energy pick it up
        if (source.resourceType) {
          let pickup = creep.pickup(source);
          if (pickup == ERR_NOT_IN_RANGE) {
            creep.moveTo(source, {
              visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5
            });

            //console.log( Game.cpu.getUsed() - startCpu ); // 0.2
          }
        }
        // if the source is a container then withdraw
        if (source.structureType == STRUCTURE_CONTAINER)  {
          if (source.store[RESOURCE_ENERGY] > 0) {
            let withdraw = creep.withdraw(source, RESOURCE_ENERGY);
            if (withdraw == ERR_NOT_IN_RANGE) {
              creep.moveTo(source, { visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5 });
            }
          } else {
            creep.memory.source = null;
          }
        }
        //if the source is storage and there are refills needed
        //console.log(Memory.targetsToRefill.length)
        if (source.structureType == STRUCTURE_STORAGE)  {
          if (source.store[RESOURCE_ENERGY] > 0 &&
              Memory.rooms[creep.memory.home].targetsToRefill.length > 0) {
            let withdraw = creep.withdraw(source, RESOURCE_ENERGY);
            if (withdraw == ERR_NOT_IN_RANGE) {
              creep.moveTo(source, { visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5 });
            }
          } else {
            creep.memory.source = null;
          }
        }
      }
    } else {
      let homeRoom = creep.memory.home;
      // creep.memory.source = null;
      delete creep.memory.source;
      if (creep.memory.targetID) {
        let target = Game.getObjectById(creep.memory.targetID);
        let transfer = creep.transfer(target, RESOURCE_ENERGY);
        //console.log(transfer)
        if (transfer == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
        if (transfer == OK || transfer == ERR_FULL) {
          delete creep.memory.targetID;
        }
        return;
      }
      let target = null;

      // refills needed for spawn and extentions
      let targetsToRefill = _.map(Memory.rooms[homeRoom].targetsToRefill,
        x => Game.getObjectById(x));

      let spawn = _.filter(targetsToRefill, s =>
        (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) &&
        s.energy < s.energyCapacity && !_.some(Game.creeps, c => c.memory.targetID == s.id));

      if (spawn.length) {
        target = creep.pos.findClosestByPath(spawn);
      }

      // refills needed for towers
      if (target === null) {
        let towers = _.filter(targetsToRefill, s =>
          s.structureType == STRUCTURE_TOWER && s.energy <= s.energyCapacity - 100 &&
          !_.some(Game.creeps, c => c.memory.targetID == s.id));

        if (towers.length) {
          target = creep.pos.findClosestByPath(towers);
        }
      }

      // drop energy to a storage
      if (!target && Memory.rooms[homeRoom].storageID) {
        let storage = Game.getObjectById(Memory.rooms[homeRoom].storageID);
        if (_.sum(storage.store) < storage.storeCapacity) {
          target = storage;
        }
      }

      if (target) {
        creep.memory.targetID = target.id;
      }
    }
	}

};
