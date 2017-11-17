// Role remote harvester

const STATE_SPAWNING = 0;
const STATE_HARVESTING = 1;
const STATE_DEPOSITING = 2;

module.exports = {
  run: function(creep) {
    if(!creep.memory.state) {
      creep.memory.state = STATE_SPAWNING;
    }
    switch(creep.memory.state) {
      case STATE_SPAWNING:
        this.runSpawning(creep);
        break;
      case STATE_DEPOSITING:
        this.runDepositing(creep);
        break;
      case STATE_HARVESTING:
        this.runHarvesting(creep);
        break;
    }
  },
  moveTo: function(creep, target) {
    creep.moveTo(target, {reusePath: 10});
  },
  runSpawning: function(creep) {
    if(!creep.spawning) {
      creep.memory.state = STATE_HARVESTING;
      this.run(creep);
      return;
    }
  },
  runHarvesting: function(creep) {
    const flagName = creep.memory.flagName;
    if (!Game.flags[flagName]) {
      creep.suicide();
    }
    if (creep.memory.roomName != Game.flags[flagName].pos.roomName) {
      this.moveTo(creep, Game.flags[flagName].pos);
      return;
    }
    if (!creep.memory.source) {
      const sources = creep.room.find(FIND_SOURCES);
      //const o = _.filter(Game.creeps, c => c.memory.flagName == flagName);
      //const c = _.countBy(o, c => c.memory.source);

      const source = _.min(_.map(sources, id => {
          const count = _.filter(Game.creeps, c => c.memory.source == id).length;
          return {id: id , count: count}
      }), x => x.count);

      creep.memory.source = source.id;
/*
  JSON.stringify(_.countBy(_.filter(Game.creeps, c => c.memory.flagName == 'Flag1'), c => c.memory.source));
;
*/
        // Flag7 || Flag1
      }
      const source = Game.getObjectById(creep.memory.source);
      const harvest = creep.harvest(source);
      if (harvest == ERR_NOT_IN_RANGE) {
        this.moveTo(creep, source);
      }
      if (creep.carry.energy == creep.carryCapacity) {
        creep.memory.state = STATE_DEPOSITING;
        this.runDepositing(creep);
      }
    },

  run: function(creep) {
    if (creep.spawning) {
      return;
    }
    if (creep.carry.energy === 0 || creep.memory.harvesting) {
      // FIX THIS !!!!!!!!!!!!!!!!!!!!!!!
      if (!Game.flags[creep.memory.flagName]) {
        creep.suicide();
      }
      // FIX THIS ^^^^^^^^^^^^^^^^^^^^^^
      if (creep.pos.roomName != Game.flags[creep.memory.flagName].pos.roomName) {
        creep.moveTo(Game.flags[creep.memory.flagName].pos, {reusePath: 10});
        return;
      }
      let source = Game.getObjectById(creep.memory.source);
      if (!creep.memory.source || source.energy == 0) {
        let sources = creep.room.find(FIND_SOURCES_ACTIVE);
        if (!sources.length) {
          sources = creep.room.find(FIND_SOURCES);
        }
        creep.memory.source = sources[0].id;
        creep.moveTo(sources[0]);
      }
      let harvest = creep.harvest(source);
      if (harvest == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, {
            visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5
        });
      }
      if (harvest == OK) {
        creep.memory.harvesting = true;
      }
      if (creep.carry.energy == creep.carryCapacity) {
        creep.memory.harvesting = false;
        delete creep.memory.source;
      }
    } else {
      if (creep.pos.roomName != creep.memory.home) {
          if (creep.memory.home) {
            creep.moveTo(Game.rooms[creep.memory.home].controller);
          }
        return;
      } else {
        creep.moveTo(Game.rooms[creep.memory.home].controller);
      }
      if (!creep.memory.target) {
        let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: structure =>
            (structure.structureType == STRUCTURE_SPAWN ||
             structure.structureType == STRUCTURE_EXTENSION) &&
             structure.energy < structure.energyCapacity
        });
        if (target === null) {
          target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: structure =>
              (structure.structureType == STRUCTURE_STORAGE ||
               structure.structureType == STRUCTURE_CONTAINER) &&
               _.sum(structure.store) < structure.storeCapacity
          });
        }
        if (target) creep.memory.target = target.id;
      }
      let target = Game.getObjectById(creep.memory.target);
      if (target !== null) {
        if (((target.structureType == STRUCTURE_SPAWN ||
              target.structureType == STRUCTURE_EXTENSION) &&
              target.energy == target.energyCapacity) ||
            ((target.structureType == STRUCTURE_STORAGE ||
              target.structureType == STRUCTURE_CONTAINER) &&
              _.sum(target.store) == target.storeCapacity))  {
          creep.memory.target = null;
          return;
        }
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {
              visualizePathStyle: {stroke: '#ffffff'},
              reusePath: 10
          });
        }
      } else {
        creep.memory.harvesting = true;
      }
    }
	}
};
