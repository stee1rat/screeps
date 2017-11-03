let roleHarvester = require('role.harvester');
let roleHarvester2 = require('role.new.harvester');
let roleUpgrader = require('role.upgrader');
let roleBuilder = require('role.builder');
let roleHauler = require('role.hauler');
let roleFixer = require('role.fixer');
let roleMiner = require('role.miner');
let towers = require('towers');

require('creeps.prototype')();

let spawnCreeps = [
  {
    role: 'harvester',
    priority: 0,
    goal: 0,
    parameters: {harvesting: false },
    bodyParts: { move: 5, work: 3, carry: 2}
  },
  {
    role: 'harvester2',
    priority: 0,
    goal: 0,
    parameters: {harvesting: false },
    bodyParts: { move: 12, work: 7, carry: 5}
  },
  {
    role: 'miner',
    goal: 2,
    priority: 1,
    parameters: { inPosition: false },
    bodyParts: { move: 1, work: 10 }
  },
  {
    role: 'hauler',
    priority: 2,
    goal: 2,
    parameters: {},
    bodyParts: { move: 8, carry: 8 }
  },
  {
    role: 'upgrader',
    priority: 3,
    goal: 5,
    parameters: {},
    bodyParts: { move: 12, carry: 5, work: 7 }
  },
  {
    role: 'builder',
    priority: 4,
    goal: 1,
    parameters: { harvesting: false },
    bodyParts: { move: 8, carry: 4, work: 4 }
  },
  {
    role: 'fixer',
    priority: 5,
    goal: 0,
    parameters: { harvesting: false, repairTaget: null},
    bodyParts: { move: 5, carry: 2, work: 3 }
  }];

spawnCreeps.sort((a, b) => a.priority - b.priority);

//if (Memory.containers == []._) Memory.containers = [];
if (Memory.sources == []._) Memory.sources = [];
Memory.parkingArea = [[34, 38], [39, 40]];

module.exports.loop = function () {
  let existingCreeps = {};

  for (let name in Memory.creeps) {
    if (!Game.creeps[name]) {

      if (Memory.creeps[name].role == 'miner') {
        if (Memory.creeps[name].source != []._) {
          let i = Memory.sources.indexOf(Memory.creeps[name].source);
          Memory.sources.splice(i, 1);
        }
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
        for (let j = 0; j < spawnCreeps[i].bodyParts[key]; j++) {
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
      let cpuUsed = Game.cpu.getUsed();
      roleHarvester.run(creep);
      console.log( 'HARVESTER: ' + (Game.cpu.getUsed() - cpuUsed ));
    }
    if(creep.memory.role == 'harvester2') {
      let cpuUsed = Game.cpu.getUsed();
      roleHarvester2.run(creep);
      console.log( 'HARVESTER2: ' + (Game.cpu.getUsed() - cpuUsed ));
    }
    if(creep.memory.role == 'upgrader') {
      let cpuUsed = Game.cpu.getUsed();
      roleUpgrader.run(creep);
      console.log( 'UPGADER: ' + (Game.cpu.getUsed() - cpuUsed ));
    }
    if(creep.memory.role == 'builder') {
      let cpuUsed = Game.cpu.getUsed();
      roleBuilder.run(creep);
      console.log( 'BUILDER: ' + (Game.cpu.getUsed() - cpuUsed ));
    }
    if(creep.memory.role == 'hauler') {
      let cpuUsed = Game.cpu.getUsed();
      roleHauler.run(creep);
      console.log( 'HAULER: ' + (Game.cpu.getUsed() - cpuUsed ));
    }
    if(creep.memory.role == 'fixer') {
      let cpuUsed = Game.cpu.getUsed();
      roleFixer.run(creep);
      console.log( 'FIXER: ' + (Game.cpu.getUsed() - cpuUsed ));
    }
    if(creep.memory.role == 'miner') {
      let cpuUsed = Game.cpu.getUsed();
      roleMiner.run(creep);
      console.log( 'MINER: ' + (Game.cpu.getUsed() - cpuUsed ));
    }
  }
  let cpuUsed = Game.cpu.getUsed();
  towers.run();
  console.log( 'TOWERS: ' + (Game.cpu.getUsed() - cpuUsed ));
};
