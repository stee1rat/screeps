var roleBuilder = {

  let customFunctions = require('custom.functions');

  run: function(creep) {
    if (creep.carry.energy == 0 || creep.memory.harvesting) {
      let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      let harvest = creep.harvest(source)

      if (harvest == ERR_NOT_IN_RANGE)
        creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});

      if (harvest == OK)
        creep.memory.harvesting = true

      if (creep.carry.energy == creep.carryCapacity)
        creep.memory.harvesting = false
    }
    else {
      let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
      if (target != null) {
        if (creep.build(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
      } else {
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
                if (creep.room.lookForAt(LOOK_CREEPS, x, y).length == 0) {
                  creep.moveTo(x, y, {visualizePathStyle: {stroke: '#ffaa00'}});
                  break;
                }
              }
            }
          }
        }
      }
    }
	}

};

module.exports = roleBuilder;
