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
    console.log(claim);
    if (claim == ERR_NOT_IN_RANGE) {
      let move = creep.moveTo(creep.room.controller);
      console.log(move);
    }
  }
};
