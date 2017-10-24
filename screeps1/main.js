var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleHauler = require('role.hauler');
var roleFixer = require('role.fixer');
var roleMiner = require('role.miner');

module.exports.loop = function () {
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var haulers = _.filter(Game.creeps, (creep) => creep.memory.role == 'hauler');
    var fixers = _.filter(Game.creeps, (creep) => creep.memory.role == 'fixer');
    var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');

    if (fixers.length < 1) {
        var newName = 'Fixer' + Game.time;
        console.log('Need to spawn a new fixer.');
        //Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE,MOVE], newName,
        //Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], newName,
        //Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], newName,
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], newName,
            {memory: {role: 'fixer', harvesting: false, repairTaget: null}});
    }

    if (upgraders.length < 6) {
        var newName = 'Upgrader' + Game.time;
        console.log('Need to spawn a new upgrader.');
        //Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE,MOVE], newName,
        //Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], newName,
        //Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], newName,
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], newName,
        //Game.spawns['Spawn1'].spawnCreep(myFunctions.bodyParts(), newName,
            {memory: {role: 'upgrader'}});
    }

    if (builders.length < 3) {
        var newName = 'Builder' + Game.time;
        console.log('Need to spawn a new builder.');
        //Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE,MOVE], newName,
        //Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], newName,
        //Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], newName,
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], newName,
        //Game.spawns['Spawn1'].spawnCreep(myFunctions.bodyParts(), newName,
            {memory: {role: 'builder', harvesting: false}});
    }

    if (miners.length < 1) {
        var newName = 'Miner' + Game.time;
        console.log('Need to spawn a new miner: ' + newName);
        //Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE,MOVE], newName,
        //Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], newName,
        //Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], newName,
        Game.spawns['Spawn1'].spawnCreep(
          [WORK,WORK,WORK,WORK,WORK,WORK,WORK,MOVE],
          newName, {memory: {role: 'miner', inPosition: false}}
        );
    }

    if (harvesters.length < 2) {
        var newName = 'Harvester' + Game.time;
        console.log('Need to spawn a new harvester.');
        //Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE,MOVE], newName,
        //Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], newName,
        //Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], newName,
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], newName,
            {memory: {role: 'harvester', harvesting: false}});
    }

    if (haulers.length < 2) {
        var newName = 'Hauler' + Game.time;
        console.log('Need to spawn a new hauler: ' + newName);
        //Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE,MOVE], newName,
        //Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], newName,
        //Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], newName,
        Game.spawns['Spawn1'].spawnCreep(
          [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
          newName, {memory: {role: 'hauler'}}
        );
    }

    if (Game.spawns['Spawn1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
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
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'hauler') {
            roleHauler.run(creep);
        }
        if(creep.memory.role == 'fixer') {
            roleFixer.run(creep);
        }
        if(creep.memory.role == 'miner') {
            roleMiner.run(creep);
        }
    }
}
