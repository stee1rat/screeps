module.exports = { // role claimer
  run: function(creep) {
    if (creep.spawning) {
      return;
    }
    if (creep.pos.roomName != creep.memory.roomName) {
      creep.moveTo(new RoomPosition(25, 25, creep.memory.roomName));
      return;
    }
    let claim = creep.claimController(creep.room.controller);
    if (claim == ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.room.controller);
    }
    if (claim == OK) {
      let flags = creep.room.find(FIND_FLAGS, {filter: f => f.memory.claim});
      _.each(flags, flag => flag.remove());
      creep.suicide();
    }
  }
};
