module.exports = {

  getEnergy: function(creep) {
    // Dropped energy
    let source = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES,
      { filter: resource => resource.resourceType == RESOURCE_ENERGY }
    );

    if (source !== null) {
      let withdraw = creep.pickup(source);
      if (withdraw == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, {
          visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5
        });
      }
    } else {
      // Container energy
      let source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: structure =>
              structure.structureType == STRUCTURE_CONTAINER &&
              structure.store[RESOURCE_ENERGY] > 0
      });

      // If nothing found return null
      if (source === null) {
        return null;
      }

      let withdraw = creep.withdraw(source, RESOURCE_ENERGY);
      if (withdraw == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
      }
    }
    return OK;
  },

  park: function(creep) {
    let x1 = Memory.parkingArea[0][0];
    let x2 = Memory.parkingArea[0][1];
    let y1 = Memory.parkingArea[1][0];
    let y2 = Memory.parkingArea[1][1];

    if (creep.pos.x < x1 || creep.pos.x > x2 ||
        creep.pos.y < y1 || creep.pos.y > y2) {
      for (let x = x1; x <= x2; x++) {
        for (let y = y1; y <= y2; y++) {
          let terrainType = Game.map.getTerrainAt(x, y, creep.room.name);
          if (terrainType != 'wall') {
            if (creep.room.lookForAt(LOOK_CREEPS, x, y).length === 0) {
              creep.moveTo(x, y, {visualizePathStyle: {stroke: '#ffaa00'}});
              break;
            }
          }
        }
      }
    }
  }
};
