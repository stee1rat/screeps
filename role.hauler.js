let roleHauler = {

  run: function(creep) {
    if (creep.spawning) {
      return;
    }
    if (creep.carry.energy === 0) {
      if (!creep.memory.source) {
        let source = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
          filter: resource => resource.resourceType == RESOURCE_ENERGY
        });
        if (source === null) {
          source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: structure =>
              (structure.structureType == STRUCTURE_CONTAINER ||
               structure.structureType == STRUCTURE_STORAGE) &&
               structure.store[RESOURCE_ENERGY] > 0
          });
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
        // if the source is container withdraw
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
        console.log(Memory.targetsToRefill.length)
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
      let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: s => (s.structureType == STRUCTURE_SPAWN ||
                      s.structureType == STRUCTURE_EXTENSION) &&
                      s.energy < s.energyCapacity &&
                      !_.some(Game.creeps, c => c.memory.role == 'hauler' &&
                                                c.memory.targetID == s.id)
      });
      if (!target) {
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: s => s.structureType == STRUCTURE_TOWER &&
                       s.energy < s.energyCapacity/2 &&
                       !_.some(Game.creeps, c => c.memory.role == 'hauler' &&
                                                 c.memory.targetID == s.id)
        });
      }
      if (!target) {
        target = creep.room.find(FIND_STRUCTURES, {
          filter: s => s.structureType == STRUCTURE_STORAGE &&
                       _.sum(s.store) < s.storeCapacity
        });
        target = target.length ? target[0] : null;
      }
      if (target) {
        creep.memory.targetID = target.id;
      }
    }
	}
};

module.exports = roleHauler;
