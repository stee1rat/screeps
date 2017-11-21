let roleHarvester = require('role.harvester');
let roleHarvester2 = require('role.new.harvester');
let roleRemoteHarvester = require('role.remoteHarvester');
//let roleUpgrader = require('role.upgrader');
let roleUpgrader2 = require('role.upgrader2');
let roleBuilder = require('role.builder');
//let roleHauler = require('role.hauler');
let roleHauler2 = require('role.hauler2');
let roleFixer = require('role.fixer');
let roleMiner = require('role.miner');
let roleMiner2 = require('role.miner2');
let roleClaimer = require('role.claimer');
let roleDefender = require('role.defender');
let towers = require('towers');

require('creeps.prototype')();

const profiler = require('screeps-profiler');
profiler.enable();

module.exports.loop = function () {
profiler.wrap(function() {

  let cpuUsed = Game.cpu.getUsed();

  for (let name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    }
  }

  for (let name in Memory.flags) {
    if (!Game.flags[name]) {
      delete Memory.flags[name];
      console.log('Clearing non-existing flag memory:', name);
    }
  }

  delete Memory.rooms;
  Memory.rooms = {}
  _.each(Game.rooms, room => {
    //console.log(room.name);
    let structures = room.find(FIND_STRUCTURES);
    let roomObject = {};
    roomObject.name = room.name;
    roomObject.structures = structures.map(s => s.id);

    roomObject.targetsToRefill = _.filter(structures, s => (
      s.structureType == STRUCTURE_SPAWN ||
      s.structureType == STRUCTURE_EXTENSION ||
      s.structureType == STRUCTURE_TOWER) &&
       s.energy < s.energyCapacity).map(s => s.id);

    roomObject.droppedEnergy = room.find(FIND_DROPPED_RESOURCES, {
      filter: s => s.resourceType == RESOURCE_ENERGY
    }).map(s => s.id);

    roomObject.containers = _.filter(structures, s =>
      s.structureType == STRUCTURE_CONTAINER).map(s => s.id);

    let roomStorage = _.filter(structures, s =>
      s.structureType == STRUCTURE_STORAGE).map(s => s.id);

    if (roomStorage.length) {
      roomObject.storageID = roomStorage[0];
    }

    Memory.rooms[room.name] = roomObject;
  });

  //console.log('Forming Memory.rooms CPU: ' + (Game.cpu.getUsed() - cpuUsed));
  cpuUsed = Game.cpu.getUsed();

  //console.log(JSON.stringify(Memory.rooms))

  let spawnsCPU = Game.cpu.getUsed();

  function optimalBody(energy, parts = [WORK, CARRY]) {
    result = [];

    Total = energy;
    move_cost = BODYPART_COST[MOVE];
    while (Total > 0) {
       for (part of parts) {
         part_cost = BODYPART_COST[part]
         if (part_cost + move_cost < Total) {
           result.push.apply(result, [part, MOVE]);
           Total -= (part_cost + move_cost);
         }
       }
      if (Total <= move_cost + 50) break;
    }
     return result.sort();
  }

  //console.log('Otpimal body CALCULATIONS CPU: ' + (Game.cpu.getUsed() - cpuUsed));
  cpuUsed = Game.cpu.getUsed();

  function spawnCreep(spawn, role, parts = false /*, opts = {}*/) {
    if (!parts) parts = optimalBody(spawn.room.energyCapacityAvailable);

    const name = role + Game.time;
    spawn.spawnCreep(parts, name, {
      memory: { role: role, home: spawn.pos.roomName }
    });
  }

  function countCreepsByRole(spawn, role) {
    return _.filter(Game.creeps, c =>
      c.memory.role == role &&
      c.pos.roomName == spawn.pos.roomName).length;
  }

  //_.each(_.filter(Game.spawns, s => s.name != 'Spawn1'), spawn => {
  _.each(Game.spawns, spawn => {
    freeToSpawn = true;

    const roomCreeps = _.filter(Game.creeps, c =>
      c.pos.roomName == spawn.pos.roomName &&
      c.memory.home == spawn.pos.roomName).length;

    const miners = countCreepsByRole(spawn, 'miner2');
    const fixers = countCreepsByRole(spawn, 'fixer');
    const upgraders = countCreepsByRole(spawn, 'upgrader2');
    const harvesters = countCreepsByRole(spawn, 'harvester');
    const haulers = countCreepsByRole(spawn, 'hauler2');

    if (spawn.room.energyCapacityAvailable < 750) {
      if (fixers < 2) {
        spawnCreep(spawn, 'fixer');
        freeToSpawn = false;
      }
      if (upgraders < 3) {
        spawnCreep(spawn, 'upgrader2');
        freeToSpawn = false;
      }
      if (harvesters/2 < spawn.memory.sources) {
        spawnCreep(spawn, 'harvester');
        freeToSpawn = false;
      }
    }

    if (spawn.room.energyCapacityAvailable >= 750 && !spawn.spawning) {
      const defenders = _.filter(Game.creeps, c =>
          c.memory.role == 'defender').length;

      if (defenders < spawn.memory.sources) {
        spawnCreep(spawn, 'defender');
        freeToSpawn = false;
      }

      const builders = _.filter(Game.creeps, c =>
          c.memory.role == 'builder').length;

      if (builders < spawn.memory.sources*2) {
        spawnCreep(spawn, 'builder');
        freeToSpawn = false;
      }

      if (upgraders < spawn.memory.sources*2) {
        spawnCreep(spawn, 'upgrader2');
        freeToSpawn = false;
      }

      if (spawn.room.energyAvailable >= 251 && haulers/2 < spawn.memory.sources) {
        let parts = roomCreeps <= 2 ?
          optimalBody(spawn.room.energyAvailable, [CARRY]) :
          spawn.room.energyCapacityAvailable <= 800 ?
           optimalBody(spawn.room.energyCapacityAvailable, [CARRY]) :
           optimalBody(800);

        spawnCreep(spawn, 'hauler2', parts);
        freeToSpawn = false;
      }

      if (miners < spawn.memory.sources) {
        let parts = roomCreeps <= 2 ?
          [MOVE,WORK] : [MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK ];
        spawnCreep(spawn, 'miner2', parts);
        freeToSpawn = false;
      }
    }

    if (freeToSpawn && !spawn.spawning) {
      // Spawning remote harvesters
      _.each(_.filter(Game.flags, f => f.memory.harvesters), flag => {
        let harvesters = _.filter(Game.creeps, c =>
          c.memory.role == 'remoteHarvester' &&
          c.memory.flagName == flag.name).length;
        if (harvesters < flag.memory.harvesters) {
            let parts = _.map({ move: 12, work: 7, carry: 5}, (p,n) => _.times(p, x => n));
            parts = _.reduce(parts, (t, n) => t.concat(n),[]);
            let role = 'remoteHarvester';
            let name = role + Game.time;
            let parameters = {
              role: role,
              home: spawn.pos.roomName,
              flagName: flag.name
            }
            spawn.spawnCreep(parts, name, { memory: parameters } );
            return false;
          }
      });

      // Spawning remote claimers
      _.each(_.filter(Game.flags, f => f.memory.claim &&
        !_.some(Game.creeps, c => c.memory.roomName == f.pos.roomName)), flag => {
          //console.log('NEED TO SPAWN A CLAIMER FOR ' + flag.name);
          let parts = _.map({ claim: 1, move: 1 }, (p, n) => _.times(p, x => n));
          parts = _.reduce(parts, (t, n) => t.concat(n),[]);
          let role = 'claimer';
          let name = role + Game.time;
          let parameters = {
            role: role,
            roomName: flag.pos.roomName
          };
          spawn.spawnCreep(parts, name, { memory: parameters } );
          return false;
      });

    }

    if (spawn.spawning) {
      let spawningCreep = Game.creeps[spawn.spawning.name];
      spawn.room.visual.text(
        'Spawning ' + spawningCreep.memory.role, spawn.pos.x + 1, spawn.pos.y,
        {align: 'left', opacity: 0.8});
    }
  });

  if (Game.spawns.Spawn1.spawning) {
    let spawningCreep = Game.creeps[Game.spawns.Spawn1.spawning.name];
    Game.spawns.Spawn1.room.visual.text(
      'Spawning ' + spawningCreep.memory.role,
      Game.spawns.Spawn1.pos.x + 1,
      Game.spawns.Spawn1.pos.y,
      {align: 'left', opacity: 0.8});
  }

  SpawnsCPU = (Game.cpu.getUsed() - spawnsCPU);

  let upgraderCPU = 0;
  let upgrader2CPU = 0;
  let haulerCPU = 0;
  let hauler2CPU = 0;
  let builderCPU = 0;
  let creepCPU ;

  _.each(_.filter(Game.creeps, c => c.memory.role != 'remoteHarvester'), creep => {
    if(creep.memory.role == 'harvester') {
      roleHarvester.run(creep);
    }
    if(creep.memory.role == 'harvester2') {
      roleHarvester2.run(creep);
    }
    if(creep.memory.role == 'upgrader2') {
      creepCPU = Game.cpu.getUsed();
      roleUpgrader2.run(creep);
      upgrader2CPU += Game.cpu.getUsed() - creepCPU;
    }
    if(creep.memory.role == 'builder') {
      creepCPU = Game.cpu.getUsed();
      roleBuilder.run(creep);
      builderCPU += Game.cpu.getUsed() - creepCPU;
    }
    if(creep.memory.role == 'fixer') {
      roleFixer.run(creep);
    }
    if(creep.memory.role == 'miner') {
      roleMiner.run(creep);
    }
    if(creep.memory.role == 'defender') {
      roleDefender.run(creep);
    }
    if(creep.memory.role == 'miner2') {
      roleMiner2.run(creep);
    }
    if(creep.memory.role == 'hauler2') {
      creepCPU = Game.cpu.getUsed();
      roleHauler2.run(creep);
      hauler2CPU += Game.cpu.getUsed() - creepCPU;
    }

  });

  remoteHarvestersCPU = Game.cpu.getUsed();
  _.each(_.filter(Game.creeps, c => c.memory.role == 'remoteHarvester'), creep => {
    roleRemoteHarvester.run(creep);
  });

  /*console.log('+---------------------------+')
  console.log('| Tick: ' + Game.time + '             |')
  console.log('+---------------------------+')
  console.log('=======================');
  console.log('SPAWNS CPU: '  + spawnsCPU);
  console.log('ALL CREEPS CPU: ' + Math.round((Game.cpu.getUsed() - cpuUsed),2));
  console.log('   Upgraders CPU: ' + Math.round(upgraderCPU));
  console.log('   Upgraders2 CPU: ' + Math.round(upgrader2CPU));
  console.log('   Haulers CPU: ' + Math.round(haulerCPU));
  console.log('   Haulers2 CPU: ' + Math.round(hauler2CPU));
  console.log('   Builders CPU: ' + Math.round(builderCPU));
  console.log('   Remote harvesters CPU: ' + Math.round((Game.cpu.getUsed() - remoteHarvestersCPU),2) );
  console.log('=======================');
*/
/*  _.each(_.filter(Game.creeps, c => c.memory.role == 'claimer'), creep => {
    cpuUsed = Game.cpu.getUsed();
  });
*/
  cpuUsed = Game.cpu.getUsed();
  towers.run();
//  console.log('TOWERS CPU: ' + Math.round((Game.cpu.getUsed() - cpuUsed),2) );
});
};
