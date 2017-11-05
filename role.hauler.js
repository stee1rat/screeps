let roleHauler = {

  run: function(creep) {
    if (creep.spawning) {
      return;
    }
    if (creep.carry.energy === 0) {
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
        if (!source && Memory.storageID) {
          let storage = Game.getObjectById(Memory.storageID);
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
            var startCpu = Game.cpu.getUsed();
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
          if (source.store[RESOURCE_ENERGY] > 0 && Memory.targetsToRefill.length > 0) {
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
      creep.memory.source = null;
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
      let targetsToRefill = _.map(Memory.targetsToRefill, x => Game.getObjectById(x));

      let spawn = _.filter(targetsToRefill, s =>
        (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) &&
        s.energy < s.energyCapacity && !_.some(Game.creeps, c => c.memory.targetID == s.id));

      if (spawn.length) {
        target = creep.pos.findClosestByPath(spawn);
      }

      // refills needed for towers
      if (!target) {
        let towers = _.filter(targetsToRefill, s =>
          s.structureType == STRUCTURE_TOWER && s.energy <= s.energyCapacity/2 &&
          !_.some(Game.creeps, c => c.memory.targetID == s.id));

        if (towers.length) {
          target = creep.pos.findClosestByPath(towers);
        }
      }

      // drop energy to a storage
      if (!target && Memory.storageID) {
        let storage = Game.getObjectById(Memory.storageID);
        if (_.sum(storage.store) < storage.storeCapacity) {
          target = storage;
        }
      }

      // drop energy to a container
      /*if (!target && Memory.containers.length) {
        console.log('CONTAINERS');
        let containers = _.map(Memory.containers, e => Game.getObjectById(e));
        let availableContainers = _.filter(containers, x =>
          _.sum(x.store) + _.sum(_.map(Game.creeps, c =>
            (c.memory.targetID == x.id && _.sum(c.carry)) || 0)) < x.storeCapacity
        );
        console.log('availableContainers: ' + availableContainers);
        console.log('availableContainers.length: ' + availableContainers.length);
        if (availableContainers) {
          target = availableContainers.sort((a, b) =>
            a.store[RESOURCE_ENERGY] - b.store[RESOURCE_ENERGY])[0];
        }
      }*/
      if (target) {
        creep.memory.targetID = target.id;
      }
    }
	}
};

module.exports = roleHauler;
