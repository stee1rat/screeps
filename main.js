let roleHarvester = require('role.harvester');
let roleUpgrader = require('role.upgrader');
let roleBuilder = require('role.builder');
let roleHauler = require('role.hauler');
let roleFixer = require('role.fixer');
let roleMiner = require('role.miner');
let customFunctions = require('custom.functions');

if (Memory.containers == []._) Memory.containers = [];

module.exports.loop = function () {
  Memory.parkingArea = [[34, 38], [39, 40]]
  let existingCreeps = {}
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
      let role = Game.creeps[i].memory.role
      if (existingCreeps[role] == []._) {
        existingCreeps[role] = 1
      } else {
        existingCreeps[role] ++
      }
    }
  }

  let harvesters = existingCreeps['harvester'] | 0;
  let upgraders = existingCreeps['upgrader'] | 0;
  let builders = existingCreeps['builder'] | 0;
  let haulers = existingCreeps['hauler'] | 0;
  let fixers = existingCreeps['fixer'] | 0;
  let miners = existingCreeps['miner'] | 0;

  if (fixers < 1) {
    var newName = 'Fixer' + Game.time;
    console.log('Need to spawn a new fixer [' + fixers + '/1]');
    Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], newName,
        {memory: {role: 'fixer', harvesting: false, repairTaget: null}});
  }

  if (builders < 3) {
    var newName = 'Builder' + Game.time;
    console.log('Need to spawn a new builder [' + builders + '/3]');
    Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], newName,
        {memory: {role: 'builder', harvesting: false}});
  }

  if (upgraders < 6) {
    var newName = 'Upgrader' + Game.time;
    console.log('Need to spawn a new upgrader [' + upgraders + '/6]');
    Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], newName,
        {memory: {role: 'upgrader'}});
  }

  if (haulers < 2) {
    var newName = 'Hauler' + Game.time;
    console.log('Need to spawn a new hauler [' + haulers + '/2]');
    Game.spawns['Spawn1'].spawnCreep(
      [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
      newName, {memory: {role: 'hauler'}}
    );
  }

  if (miners < 2) {
    var newName = 'Miner' + Game.time;
    console.log('Need to spawn a new miner [' + miners + '/2]');
    Game.spawns['Spawn1'].spawnCreep(
      [WORK,WORK,WORK,WORK,WORK,WORK,WORK,MOVE],
      newName, {memory: {role: 'miner', inPosition: false}}
    );
  }

  if (harvesters < 2) {
    var newName = 'Harvester' + Game.time;
    console.log('Need to spawn a new harvester [' + harvesters + '/2]');
    Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], newName,
        {memory: {role: 'harvester', harvesting: false}});
  }

  if (Game.spawns['Spawn1'].spawning) {
    var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
    Game.spawns['Spawn1'].room.visual.text(
      'Spawning ' + spawningCreep.memory.role,
      Game.spawns['Spawn1'].pos.x + 1,
      Game.spawns['Spawn1'].pos.y,
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
}
