let roleHarvester = require('role.harvester');
let roleHarvester2 = require('role.new.harvester');
let roleRemoteHarvester = require('role.remoteHarvester');
let roleUpgrader = require('role.upgrader');
let roleBuilder = require('role.builder');
let roleHauler = require('role.hauler');
let roleFixer = require('role.fixer');
let roleMiner = require('role.miner');
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
    goal: 0,
    parameters: { harvesting: false },
    bodyParts: { move: 8, carry: 4, work: 4 }
  },
  {
    role: 'defender',
    priority: 9,
    goal: 2,
    parameters: { harvesting: false, repairTaget: null},
    bodyParts: { move: 7, tough: 3, attack: 3, heal: 1 }
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
  let TOTAL_CPU = Game.cpu.getUsed();
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

  for (let name in Memory.flags) {
    if (!Game.flags[name]) {
      delete Memory.flags[name];
      console.log('Clearing non-existing flag memory:', name);
    }
  }

  let spawn = Game.spawns.Spawn1;
  if (!spawn.spawning) {
    // Spawning remote harvesters
    _.each(_.filter(Game.flags, f => f.memory.harvesters), flag => {
      let harvesters = _.filter(Game.creeps, c =>
        c.memory.role == 'remoteHarvester' &&
        c.memory.flagName == flag.name).length;
      if (harvesters < flag.memory.harvesters) {
          console.log('NEED TO SPAWN ' + (flag.memory.harvesters - harvesters) +
                      ' REMOTE HARVESTERS FOR ' + flag.name);
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
        console.log('NEED TO SPAWN A CLAIMER FOR ' + flag.name);
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

  _.each(_.filter(Game.spawns, s => s.name != 'Spawn1'), spawn => {
    if (!spawn.memory.sources) {
      spawn.memory.sources = spawn.room.find(FIND_SOURCES).length;
    }

    const miners = _.filter(Game.creeps, c =>
      c.memory.role == 'miner' &&
      c.pos.roomName == spawn.pos.roomName).length;

    if (spawn.room.energyCapacityAvailable == 300) {
      //spawn harvesters
      const harvesters = _.filter(Game.creeps, c =>
          c.memory.role == 'harvester' &&
          c.pos.roomName == spawn.pos.roomName).length;
      if (harvesters/2 < spawn.memory.sources) {
        let parts = _.map({ move: 1, work: 1, carry: 1}, (p,n) => _.times(p, x => n));
        parts = _.reduce(parts, (t, n) => t.concat(n),[]);
        let role = 'harvester';
        let name = role + Game.time;
        let parameters = { role: role, harvesting: false }
        spawn.spawnCreep(parts, name, { memory: parameters } )
      }

      //spawn upgraders
      const upgraders = _.filter(Game.creeps, c =>
          c.memory.role == 'upgrader' &&
          c.pos.roomName == spawn.pos.roomName).length;
      if (upgraders < 3) {
        let parts = _.map({ move: 1, work: 1, carry: 1}, (p,n) => _.times(p, x => n));
        parts = _.reduce(parts, (t, n) => t.concat(n),[]);
        let role = 'upgrader';
        let name = role + Game.time;
        let parameters = { role: role, harvesting: false }
        spawn.spawnCreep(parts, name, { memory: parameters } )
      }
    }

    if (spawn.room.energyCapacityAvailable >= 750) {
      // upgrader = [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY]
      // miner = [MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK]
      // hauler = [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]

      const upgraders = _.filter(Game.creeps, c =>
          c.memory.role == 'upgrader' &&
          c.pos.roomName == spawn.pos.roomName).length;

      if (upgraders < spawn.memory.sources*2) {
        let role = 'upgrader';
        let name = role + Game.time;
        let parameters = { role: role }
        spawn.spawnCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY], name, { memory: parameters } );
      }

      const haulers = _.filter(Game.creeps, c =>
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
  });

  _.each(_.filter(Game.creeps, c => c.memory.role != 'remoteHarvester'), creep => {
    if(creep.memory.role == 'harvester') {
      roleHarvester.run(creep);
    }
    if(creep.memory.role == 'harvester2') {
      roleHarvester2.run(creep);
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
    if(creep.memory.role == 'defender') {
      roleDefender.run(creep);
    }
  });

  _.each(_.filter(Game.creeps, c => c.memory.role == 'remoteHarvester'), creep => {
    cpuUsed = Game.cpu.getUsed();
    roleRemoteHarvester.run(creep);
  });

  _.each(_.filter(Game.creeps, c => c.memory.role == 'claimer'), creep => {
    cpuUsed = Game.cpu.getUsed();
  });

  cpuUsed = Game.cpu.getUsed();
  towers.run();
});
};
