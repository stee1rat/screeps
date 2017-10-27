let roleHarvester = require('role.harvester');
let roleUpgrader = require('role.upgrader');
let roleBuilder = require('role.builder');
let roleHauler = require('role.hauler');
let roleFixer = require('role.fixer');
let roleMiner = require('role.miner');

let towers = require('towers');
let customFunctions = require('custom.functions');

let spawnCreeps = [
  {
    role: 'harvester',
    priority: 0,
    goal: 2,
    parameters: {harvesting: false },
    bodyParts: { move: 5, work: 3, carry: 2}
  },
  {
    role: 'miner',
    goal: 2,
    priority: 1,
    parameters: { inPosition: false },
    bodyParts: { move: 1, work: 7 }
  },
  {
    role: 'hauler',
    priority: 2,
    goal: 2,
    parameters: { inPosition: false },
    bodyParts: { move: 7, carry: 7 }
  },
  {
    role: 'upgrader',
    priority: 3,
    goal: 6,
    parameters: {},
    bodyParts: { move: 5, carry: 2, work: 3 }
  },
  {
    role: 'builder',
    priority: 4,
    goal: 3,
    parameters: { harvesting: false },
    bodyParts: { move: 5, carry: 2, work: 3 }
  },
  {
    role: 'fixer',
    priority: 5,
    goal: 1,
    parameters: { harvesting: false, repairTaget: null},
    bodyParts: { move: 5, carry: 2, work: 3 }
  }];

spawnCreeps.sort((a, b) => a.priority - b.priority);

if (Memory.containers == []._) Memory.containers = [];
Memory.parkingArea = [[34, 38], [39, 40]];

module.exports.loop = function () {

  let existingCreeps = {};
  for (let name in Memory.creeps) {
    if (!Game.creeps[name]) {
      if (Memory.creeps[name].role == 'miner' &&
          Memory.creeps[name].assignedContainer != []._) {
        i = Memory.containers.indexOf(Memory.creeps[name].assignedContainer);
        Memory.containers.splice(i, 1);
      }
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    } else {
      let role = Game.creeps[name].memory.role;
      if (existingCreeps[role] == []._) {
        existingCreeps[role] = 1;
      } else {
        existingCreeps[role] ++;
      }
    }
  }

  for (let i = 0; i < spawnCreeps.length; i++) {

    let role = spawnCreeps[i].role;
    let goal = spawnCreeps[i].goal;
    let count = existingCreeps[role] || 0;

    if (count < goal) {
      let name = role + Game.time;
      console.log('Need to spawn a new ' + role + ' [' + count + '/' + goal +']');

      let parts = [];
      for (let key in spawnCreeps[i].bodyParts) {
        for (j = 0; j < spawnCreeps[i].bodyParts[key]; j++) {
          parts.push(key);
        }
      }

      let parameters = spawnCreeps[i].parameters;
      parameters.role = role;
      Game.spawns.Spawn1.spawnCreep(parts, name, { memory: parameters } );

      break;
    }
  }

  if (Game.spawns.Spawn1.spawning) {
    let spawningCreep = Game.creeps[Game.spawns.Spawn1.spawning.name];
    Game.spawns.Spawn1.room.visual.text(
      'Spawning ' + spawningCreep.memory.role,
      Game.spawns.Spawn1.pos.x + 1,
      Game.spawns.Spawn1.pos.y,
      {align: 'left', opacity: 0.8});
  }

  for(var name in Game.creeps) {
    var creep = Game.creeps[name];
    if(creep.memory.role == 'harvester') {
      roleHarvester.run(creep);
    }
    if(creep.memory.role == 'upgrader') {
      roleUpgrader.run(creep);
    }
    if(creep.memory.role == 'builder') {
      roleBuilder.run(creep, customFunctions);
    }
    if(creep.memory.role == 'hauler') {
      roleHauler.run(creep, customFunctions);
    }
    if(creep.memory.role == 'fixer') {
      roleFixer.run(creep);
    }
    if(creep.memory.role == 'miner') {
      roleMiner.run(creep, customFunctions);
    }
  }

  towers.run();
};
