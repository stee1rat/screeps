var roleUpgrader = {

  /** @param {Creep} creep **/
  run: function(creep) {

    if (creep.memory.upgrading && creep.carry.energy == 0) {
      creep.memory.upgrading = false;
      creep.say('🔄 harvest');
    }

    if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
      creep.memory.upgrading = true;
      creep.say('⚡ upgrade');
    }

    if (creep.memory.upgrading) {
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
      }
    }
    else {
      //var sources = creep.room.find(FIND_SOURCES);
      var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
      }
    }

    // check if moving on a road
    /*var tileObjects = creep.room.lookAt(creep.pos.x, creep.pos.y)
    var buildRoad = true
    for (i in tileObjects) {
      if (tileObjects[i].type == 'constructionSite' ||
          tileObjects[i].type == 'structure') {
        buildRoad = false
      }
    }

    if (buildRoad) {
      creep.room.createConstructionSite(creep.pos.x, creep.pos.y, STRUCTURE_ROAD);
    }*/
	}
};

module.exports = roleUpgrader;
