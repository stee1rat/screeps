var towers = {
  run: function() {
    let towers = Game.spawns.Spawn1.room.find(FIND_MY_STRUCTURES,
        { filter: { structureType: STRUCTURE_TOWER } }
    );
    let hostiles = Game.spawns.Spawn1.room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length) {
      towers.forEach(tower => tower.attack(hostiles[0]));
      return;
    }
    let hurtCreeps = Game.spawns.Spawn1.room.find(FIND_MY_CREEPS,
      { filter: creep => creep.hits < creep.hitsMax }
    );
    if(hurtCreeps.length) {
      towers.forEach(tower => tower.heal(hurtCreeps[0]));
      return;
    }
    let damagedStructures = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, {
      filter: structure => structure.hits < structure.hitsMax &&
              structure.hits < 50000
    });
    if(damagedStructures.length) {
      towers.forEach(tower => {
        if (tower.energy > tower.energyCapacity / 2) {
          tower.repair(damagedStructures[0]);
        }
      });
    }
  }
};

module.exports = towers;
