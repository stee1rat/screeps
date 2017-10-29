module.exports = {
  print: function() {
    console.log(':DDDDDDDDDDDDDDDDDDDD');
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
            if (creep.room.lookForAt(LOOK_CREEPS, x, y).length == 0) {
              creep.moveTo(x, y, {visualizePathStyle: {stroke: '#ffaa00'}});
              break;
            }
          }
        }
      }
    }
  }
};
