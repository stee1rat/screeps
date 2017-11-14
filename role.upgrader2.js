// Role upgrader
// https://screepsworld.com/2017/09/screeps-tutorial-handling-creep-roles-with-a-state-machine/
// Upgrader role implementation using the state machine from the tutorial above

const STATE_SPAWNING = 0;
const STATE_MOVING = 1;
const STATE_HARVESTING = 2;
const STATE_DEPOSITING = 3;

module.exports = {
  run (creep) {
    if(!creep.memory.state) {
      creep.memory.state = STATE_SPAWNING;
    }
    switch(creep.memory.state) {
      case STATE_SPAWNING:
        //runSpawning(creep);
        console.log('IT"S WORKING')
        break;
      case STATE_MOVING:
        runMoving(creep);
        break;
      case STATE_HARVESTING:
        runHarvesting(creep);
        break;
      case STATE_DEPOSITING:
        runDepositing(creep);
        break;
    }
  }
};
