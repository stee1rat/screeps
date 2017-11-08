let roleClaimer = {
  run: function(creep) {
    if (creep.spawning) {
      return;
    }
    if (creep.pos.roomName != creep.memory.roomName) {
      creep.moveTo(new RoomPosition(25, 25, creep.memory.roomName));
      return;
    }
    console.log(creep.pos.roomName, creep.memory.roomName, creep.memory.controller);
    if (!creep.memory.controller) {
      let controller = this.getNearestController(creep);
      console.log('controller: ' + controller);
      if (controller.length) {
        creep.memory.controller = controller.id;
      }
    }
    if (creep.memory.controller) {
      let controller = Game.getObjectById(creep.memory.controller);
      if (!creep.claimController(controller)) {
        creep.moveTo(controller);
      }
    }
  },
  getNearestController: function(creep) {
    return creep.room.find(FIND_STRUCTURES, {
      filter: s => s.structureType == STRUCTURE_CONTROLLER
    })[0];
  }
};
module.exports = roleClaimer;
