//
let roleHarvester = require('role.harvester');
let roleHarvester2 = require('role.new.harvester');
let roleRemoteHarvester = require('role.remoteHarvester');
let roleUpgrader = require('role.upgrader');
let roleBuilder = require('role.builder');
let roleHauler = require('role.hauler');
let roleFixer = require('role.fixer');
let roleMiner = require('role.miner');
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
    console.log('CLAIMERS: ' + _.filter(Game.flags, f => f.memory.claim &&
      !_.some(Game.creeps, c => c.memory.flagName == f.name)).length);
    _.each(_.filter(Game.flags, f => f.memory.claim &&
      !_.some(Game.creeps, c => c.memory.flagName == f.name), flag => {
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
    }));
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

  let cpuUsed = Game.cpu.getUsed();

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

  _.each(_.filter(Game.creeps, c => c.memory.role != 'remoteHarvester'), creep => {
    if(creep.memory.role == 'harvester') {
      cpuUsed = Game.cpu.getUsed();
      roleHarvester.run(creep);
    //  console.log( 'HARVESTER: ' + (Game.cpu.getUsed() - cpuUsed ));
    }
    if(creep.memory.role == 'harvester2') {
      cpuUsed = Game.cpu.getUsed();
      roleHarvester2.run(creep);
      //console.log( 'HARVESTER2: ' + (Game.cpu.getUsed() - cpuUsed ));
    }
    if(creep.memory.role == 'upgrader') {
      cpuUsed = Game.cpu.getUsed();
      roleUpgrader.run(creep);
      //console.log( 'UPGADER: ' + (Game.cpu.getUsed() - cpuUsed ));
      if (Game.cpu.getUsed() - cpuUsed > 0.5) {
        //creep.say('CPU: ' + (Game.cpu.getUsed() - cpuUsed) + '!!!!!')
      }
    }
    if(creep.memory.role == 'builder') {
      cpuUsed = Game.cpu.getUsed();
      roleBuilder.run(creep);
      //console.log( 'BUILDER: ' + (Game.cpu.getUsed() - cpuUsed ));
    }
    if(creep.memory.role == 'hauler') {
      cpuUsed = Game.cpu.getUsed();
      roleHauler.run(creep);
      //console.log( 'HAULER: ' + (Game.cpu.getUsed() - cpuUsed ));
      if (Game.cpu.getUsed() - cpuUsed > 0.5) {
        creep.say('CPU: ' + (Game.cpu.getUsed() - cpuUsed) + '!!!!!')
      }
    }
    if(creep.memory.role == 'fixer') {
      cpuUsed = Game.cpu.getUsed();
      roleFixer.run(creep);
      //console.log( 'FIXER: ' + (Game.cpu.getUsed() - cpuUsed ));
    }
    if(creep.memory.role == 'miner') {
      cpuUsed = Game.cpu.getUsed();
      roleMiner.run(creep);
      //console.log( 'MINER: ' + (Game.cpu.getUsed() - cpuUsed ));
    }
  });

  _.each(_.filter(Game.creeps, c => c.memory.role == 'remoteHarvester'), creep => {
    if(creep.memory.role == 'remoteHarvester') {
      cpuUsed = Game.cpu.getUsed();
      roleRemoteHarvester.run(creep);
      //console.log( 'REMOTEHARVESTER: ' + (Game.cpu.getUsed() - cpuUsed ));
    }
  });

  //for (let name in Game.flags) {
    //console.log(JSON.stringify(Game.flags[name].memory));
  //}
  cpuUsed = Game.cpu.getUsed();
  towers.run();
  //console.log( 'TOWERS: ' + (Game.cpu.getUsed() - cpuUsed ));
  //console.log( 'TOTAL: ' + (Game.cpu.getUsed() - TOTAL_CPU ));
});
};
