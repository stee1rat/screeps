var roleHauler = {

    run: function(creep) {

      if (creep.carry.energy == 0) {
        let source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: structure =>
                    structure.structureType == STRUCTURE_CONTAINER &&
                    structure.store[RESOURCE_ENERGY] > 0
        })

        if (source == null) {
          let x1 = Memory.parkingArea[0][0];
          let x2 = Memory.parkingArea[0][1];
          let y1 = Memory.parkingArea[1][0];
          let y2 = Memory.parkingArea[1][1];

          for (let x = x1; x <= x2; x++) {
            for (let y = y1; y <= y2; y++) {
              let terrainType = Game.map.getTerrainAt(x, y, creep.room.name);
              if (terrainType != 'wall') {
                if (creep.room.lookForAt(LOOK_CREEPS, x, y).length) == 0) {
                  creep.moveTo(x, y, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
              }
            }
          }

        }

        let withdraw = creep.withdraw(source, RESOURCE_ENERGY);

        if (withdraw == ERR_NOT_IN_RANGE) {
          creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
      } else {
        let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_EXTENSION) &&
                        structure.energy < structure.energyCapacity;
                }
        })

        if (target != null) {
          if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
          }
        }
      }
	}
};

module.exports = roleHauler;
