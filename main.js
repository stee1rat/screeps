let roleHarvester = require('role.harvester');
let roleHarvester2 = require('role.new.harvester');
let roleRemoteHarvester = require('role.remoteHarvester');
let roleUpgrader = require('role.upgrader');
let roleUpgrader2 = require('role.upgrader2');
let roleBuilder = require('role.builder');
let roleHauler = require('role.hauler');
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
    bodyParts: { move: 2, work: 6 }
  },
  {
    role: 'hauler',
    priority: 2,
    goal: 5,
    parameters: {},
    bodyParts: { move: 7, carry: 7 }
  },
  {
    role: 'upgrader',
    priority: 3,
    goal: 4,
    parameters: {},
    bodyParts: { move: 8, carry: 4, work: 4 }
  },
  {
    role: 'builder',
    priority: 4,
    goal: 3,
    parameters: { harvesting: false },
    bodyParts: { move: 8, carry: 4, work: 4 }
  },
  {
    role: 'defender',
    priority: 9,
    goal: 3,
    parameters: { harvesting: false, repairTaget: null},
    //bodyParts: { move: 7, tough: 3, attack: 3, heal: 1 }
    bodyParts: { move: 12, tough: 5, attack: 5, heal: 2 }
  },
  {
    role: 'fixer',
    priority: 5,
    goal: 0,
    parameters: { },
    bodyParts: { move: 7, carry: 2, work: 3 }
  }];

spawnCreeps.sort((a, b) => a.priority - b.priority);

if (Memory.sources == []._) Memory.sources = [];

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

  console.log('Memory clean up CPU: ' + (Game.cpu.getUsed() - cpuUsed));
  cpuUsed = Game.cpu.getUsed();

  let spawn = Game.spawns.Spawn1;
  if (!spawn.spawning) {
    // Spawning remote harvesters
    _.each(_.filter(Game.flags, f => f.memory.harvesters), flag => {
      let harvesters = _.filter(Game.creeps, c =>
        c.memory.role == 'remoteHarvester' &&
        c.memory.flagName == flag.name).length;
      if (harvesters < flag.memory.harvesters) {
          /*console.log('NEED TO SPAWN ' + (flag.memory.harvesters - harvesters) +
                      ' REMOTE HARVESTERS FOR ' + flag.name);*/
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

  for (let i = 0; i < spawnCreeps.length; i++) {
    let role = spawnCreeps[i].role;
    let goal = spawnCreeps[i].goal;
    //let count = existingCreeps[role] || 0;
    let count;

    if (role == 'builder' || role == 'defender') {
      count = _.filter(Game.creeps, c => c.memory.role == role).length;
    } else {
      count = _.filter(Game.creeps, c =>
        c.room.name == Game.spawns.Spawn1.room.name &&
        c.memory.role == role).length;
      console.log(role, count, goal);
    }


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
/*  console.log('------- rooms --------')
  _.each(_.filter(Game.rooms, r => r.controller.my), r => console.log(r.name, r.name));*/

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
      (s.structureType == STRUCTURE_TOWER &&
       s.energy <= s.energyCapacity/2)) &&
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

  //console.log(JSON.stringify(Memory.rooms))

  let spawnsCPU = Game.cpu.getUsed();
  let optimalBody = (energy, parts = [WORK, CARRY]) => {
    //parts = [WORK, CARRY];
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

  _.each(_.filter(Game.spawns, s => s.name != 'Spawn1'), spawn => {
    const miners = _.filter(Game.creeps, c =>
      c.memory.role == 'miner' &&
      c.pos.roomName == spawn.pos.roomName).length;

    if (spawn.room.energyCapacityAvailable < 750) {
      //spawn fixers
      const fixers = _.filter(Game.creeps, c =>
          c.memory.role == 'fixer' &&
          c.pos.roomName == spawn.pos.roomName).length;
      if (fixers < 2) {
        //let parts = _.map({ move: 1, work: 1, carry: 1}, (p,n) => _.times(p, x => n));
        //parts = _.reduce(parts, (t, n) => t.concat(n),[]);
        let parts = optimalBody(spawn.room.energyCapacityAvailable);
        let role = 'fixer';
        let name = role + Game.time;
        let parameters = { role: role, harvesting: false }
        spawn.spawnCreep(parts, name, { memory: parameters } )
      }

      //spawn upgraders
      const upgraders = _.filter(Game.creeps, c =>
          c.memory.role == 'upgrader' &&
          c.pos.roomName == spawn.pos.roomName).length;
      if (upgraders < 3) {
        /*let parts = _.map({ move: 1, work: 1, carry: 1}, (p,n) => _.times(p, x => n));
        parts = _.reduce(parts, (t, n) => t.concat(n),[]);*/
        let parts = optimalBody(spawn.room.energyCapacityAvailable);
        let role = 'upgrader';
        let name = role + Game.time;
        let parameters = { role: role, harvesting: false }
        spawn.spawnCreep(parts, name, { memory: parameters } )
      }

      //spawn harvesters
      const harvesters = _.filter(Game.creeps, c =>
          c.memory.role == 'harvester' &&
          c.pos.roomName == spawn.pos.roomName).length;
      if (harvesters/2 < spawn.memory.sources) {
        /*let parts = _.map({ move: 1, work: 1, carry: 1}, (p,n) => _.times(p, x => n));
        parts = _.reduce(parts, (t, n) => t.concat(n),[]);*/
        let parts = optimalBody(spawn.room.energyCapacityAvailable);
        let role = 'harvester';
        let name = role + Game.time;
        let parameters = { role: role, harvesting: false }
        spawn.spawnCreep(parts, name, { memory: parameters } )
      }
    }

    if (spawn.room.energyCapacityAvailable >= 750 && !spawn.spawning) {
      /*const fixers = _.filter(Game.creeps, c =>
          c.memory.role == 'fixer' &&
          c.pos.roomName == spawn.pos.roomName).length;
      if (fixers < 1) {
        //let parts = _.map({ move: 1, work: 1, carry: 1}, (p,n) => _.times(p, x => n));
        //parts = _.reduce(parts, (t, n) => t.concat(n),[]);
        //let parts = optimalBody(spawn.room.energyCapacityAvailable);

        let parts = spawn.room.energyCapacityAvailable <= 800 ?
          optimalBody(spawn.room.energyCapacityAvailable) :
          optimalBody(800);

        let role = 'fixer';
        let name = role + Game.time;
        let parameters = { role: role, harvesting: false }
        spawn.spawnCreep(parts, name, { memory: parameters } )
      }*/

      const upgraders = _.filter(Game.creeps, c =>
          c.memory.role == 'upgrader' &&
          c.pos.roomName == spawn.pos.roomName).length;

      if (upgraders < spawn.memory.sources*2) {
        let role = 'upgrader';
        //[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY]
        let parts = optimalBody(spawn.room.energyCapacityAvailable);
        let name = role + Game.time;
        let parameters = { role: role }
        spawn.spawnCreep(parts, name, { memory: parameters } );
      }

  /*    const haulers = _.filter(Game.creeps, c =>
          c.memory.role == 'hauler' &&
          c.pos.roomName == spawn.pos.roomName).length;

      if (haulers < spawn.memory.sources*2) {
        let role = 'hauler';
        let name = role + Game.time;
        let parameters = { role: role }
        spawn.spawnCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY], name, { memory: parameters } );
      }

      const miners = _.filter(Game.creeps, c =>
          c.memory.role == 'miner' &&
          c.pos.roomName == spawn.pos.roomName).length;

      if (miners < spawn.memory.sources) {
        let role = 'miner';
        let name = role + Game.time;
        let parameters = { role: role }
        spawn.spawnCreep([MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK], name, { memory: parameters } );
      }*/

      let roomCreeps = _.filter(Game.creeps, c =>
        c.pos.roomName == spawn.pos.roomName &&
        c.memory.home == spawn.pos.roomName).length;

      const harvesters = _.filter(Game.creeps, c =>
          c.memory.role == 'harvester2' &&
          c.pos.roomName == spawn.pos.roomName).length;

      //console.log(spawn.room.energyAvailable + '/' + spawn.room.energyCapacityAvailable, optimalBody(spawn.room.energyAvailable))

      //if (spawn.room.energyAvailable >= 251 && harvesters/2 < spawn.memory.sources) {
      /*if (spawn.room.energyAvailable >= 251 && harvesters < 2) {
        let parts = roomCreeps <= 2 ?
          optimalBody(spawn.room.energyAvailable) :
          optimalBody(spawn.room.energyCapacityAvailable)

        let role = 'harvester2';
        let name = role + Game.time;
        let parameters = { role: role, home: spawn.pos.roomName }
        spawn.spawnCreep(parts, name, { memory: parameters } )
      }*/

      const haulers = _.filter(Game.creeps, c =>
          c.memory.role == 'hauler2' &&
          c.pos.roomName == spawn.pos.roomName).length;

      if (spawn.room.energyAvailable >= 251 && haulers/2 < spawn.memory.sources) {
        let parts = roomCreeps <= 2 ?
          optimalBody(spawn.room.energyAvailable, [CARRY]) :
          spawn.room.energyCapacityAvailable <= 800 ?
           optimalBody(spawn.room.energyCapacityAvailable, [CARRY]) :
           optimalBody(800);

        let role = 'hauler2';
        let name = role + Game.time;
        let parameters = { role: role, home: spawn.pos.roomName }
        spawn.spawnCreep(parts, name, { memory: parameters } )
      }

      const miners = _.filter(Game.creeps, c =>
          c.memory.role == 'miner2' &&
          c.pos.roomName == spawn.pos.roomName).length;

      //if (spawn.room.energyAvailable >= 251 && miners < 1) {
      if (miners < spawn.memory.sources) {
        let parts = roomCreeps <= 2 ?
          [MOVE,WORK] : [MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK ];

        let role = 'miner2';
        let name = role + Game.time;
        let parameters = { role: role, home: spawn.pos.roomName }
        spawn.spawnCreep(parts, name, { memory: parameters } )
      }
    }

    if (miners < spawn.memory.sources) {
      //spawn miner
      /*let parts = _.map({ move: 1, work: 1}, (p,n) => _.times(p, x => n));
      parts = _.reduce(parts, (t, n) => t.concat(n),[]);
      let role = 'miner';
      let name = role + Game.time;
      let parameters = {
        role: role,
        home: spawn.pos.roomName,
        flagName: flag.name
      }
      spawn.spawnCreep(parts, name, { memory: parameters } );*/
    }

    if (spawn.spawning) {
      let spawningCreep = Game.creeps[spawn.spawning.name];
      spawn.room.visual.text(
        'Spawning ' + spawningCreep.memory.role, spawn.pos.x + 1, spawn.pos.y,
        {align: 'left', opacity: 0.8});
    }
  });

  /*_.each(Memory.rooms, room => {
    //console.log('===========' + room.name + '=============')
    _.each(room.targetsToRefill, t => {
      //console.log(Game.getObjectById(t).structureType);
    });
  });*/
  SpawnsCPU = (Game.cpu.getUsed() - spawnsCPU);

  // TO BE REMOVED
  let structures = Game.spawns.Spawn1.room.find(FIND_STRUCTURES);

  Memory.structures = structures.map(s => s.id);

  Memory.targetsToRefill = _.filter(structures, s => (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION ||
               (s.structureType == STRUCTURE_TOWER && s.energy <= s.energyCapacity/2)) &&
                s.energy < s.energyCapacity).map(s => s.id);

  Memory.droppedEnergy = Game.spawns.Spawn1.room.find(FIND_DROPPED_RESOURCES, {
    filter: s => s.resourceType == RESOURCE_ENERGY}).map(s => s.id);

  Memory.containers = _.filter(structures, s => s.structureType == STRUCTURE_CONTAINER).map(s => s.id);

  Memory.storageID = _.filter(structures, s => s.structureType == STRUCTURE_STORAGE).map(s => s.id || null);
  if (!Memory.storageID.length) {
    delete Memory.storageID ;
  }
  // TO BE REMOVED ^^^^^^
  console.log('CALCULATIONS CPU: ' + Math.round((Game.cpu.getUsed() - cpuUsed),2) );
  cpuUsed = Game.cpu.getUsed();

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
    if(creep.memory.role == 'upgrader') {
      creepCPU = Game.cpu.getUsed();
      roleUpgrader2.run(creep);
      //console.log(creep.name + ' CPU: ' + (Game.cpu.getUsed() - creepCPU));
      upgraderCPU += Game.cpu.getUsed() - creepCPU;
    }
    if(creep.memory.role == 'upgrader2') {
      creepCPU = Game.cpu.getUsed();
      roleUpgrader2.run(creep);
    //  console.log(creep.name + ' CPU: ' + (Game.cpu.getUsed() - creepCPU));
      upgrader2CPU += Game.cpu.getUsed() - creepCPU;
    }
    if(creep.memory.role == 'builder') {
      creepCPU = Game.cpu.getUsed();
      roleBuilder.run(creep);
      builderCPU += Game.cpu.getUsed() - creepCPU;
    }
    if(creep.memory.role == 'hauler') {
      creepCPU = Game.cpu.getUsed();
      roleHauler.run(creep);
      haulerCPU += Game.cpu.getUsed() - creepCPU    }

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

  console.log('+---------------------------+')
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

/*  _.each(_.filter(Game.creeps, c => c.memory.role == 'claimer'), creep => {
    cpuUsed = Game.cpu.getUsed();
  });
*/
  cpuUsed = Game.cpu.getUsed();
  towers.run();
  console.log('TOWERS CPU: ' + Math.round((Game.cpu.getUsed() - cpuUsed),2) );
});
};
