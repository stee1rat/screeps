module.exports = { // role builder
  run: function(creep) {
    if (creep.carry.energy == creep.carryCapacity) {
      creep.memory.harvesting = false
    };
    if (creep.carry.energy == 0 || creep.memory.harvesting) {
      delete creep.memory.targetID;
      creep.getEnergy();
    }
    else {
      if (!creep.memory.targetID) {
        _.each(_.filter(Game.rooms, r => r.controller.my), room => {
          const target = room.find(FIND_CONSTRUCTION_SITES);
          if (target.length) {
            creep.memory.targetID = target[0].id;
          }
        });
      }
      if (creep.memory.targetID) {
        const target = Game.getObjectById(creep.memory.targetID);
        if (!target) {
            delete creep.memory.targetID;
        }
        if (creep.build(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: {stroke: '#ffffff'},
              reusePath: 10
          });
        }
      }
    }
	}
};
