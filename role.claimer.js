let roleClaimer = {
  run: function(creep) {
    if (creep.spawning) {
      return;
    }
    if (creep.pos.roomName != creep.memory.roomName) {
      creep.moveTo(new RoomPosition(25, 25, creep.memory.roomName));
      return;
    }
    /*if (!creep.memory.controller) {
      let controller = this.getRoomController(creep);
      if (controller.length) {
        creep.memory.controller = controller[0].id;
      }
    }*/
    //if (creep.memory.controller) {
      let claim = creep.claimController(creep.room.controller);
      console.log(claim);
      if (claim == ERR_NOT_IN_RANGE) {
        let move = creep.moveTo(controller);
        console.log(move);
      }
  //  }
  }
};
/*let roleClaimer = {
  run: function(creep) {
    if (creep.spawning) {
      return;
    }
    if (creep.pos.roomName != creep.memory.roomName) {
      creep.moveTo(new RoomPosition(25, 25, creep.memory.roomName));
      return;
    }
    if (!creep.memory.controller) {
      let controller = this.getRoomController(creep);
      if (controller.length) {
        creep.memory.controller = controller[0].id;
      }
    }
    if (creep.memory.controller) {
      let controller = Game.getObjectById(creep.memory.controller);
      if (!creep.claimController(creep.room.controller)) {
        console.log(creep.moveTo(controller));
      }
    }
  },
  getRoomController: function(creep) {
    return creep.room.find(FIND_STRUCTURES, {
      filter: s => s.structureType == STRUCTURE_CONTROLLER
    });
  }
};*/
module.exports = roleClaimer;
