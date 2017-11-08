let roleClaimer = {
  run: function(creep) {
    if (creep.spawning) {
      return;
    }
    if (!creep.memory.controller) {
      if (creep.pos.roomName != creep.memory.roomName) {
        creep.moveTo(new RoomPosition(25, 25, creep.memory.roomName));
        return;
      }
      let controller = this.getNearestController(creep);
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
      filter: s => structure.structureType == STRUCTURE_CONTROLLER
    });
  }
};
module.exports = roleClaimer;
