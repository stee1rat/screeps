var towers = {

  run: function() {
    let towers = Game.spawns.Spawn1.room.find(FIND_MY_STRUCTURES,
        { filter: { structureType: STRUCTURE_TOWER } }
    );

    let towersLength = towers.length;
    for (let i = 0; i < towersLength; i++) {
      let tower = towers[i];

      let hostiles = tower.room.find(FIND_HOSTILE_CREEPS);
      if (hostiles.length) {
        tower.attack(hostiles[0]);
        continue;
      }

      if (tower.energy > tower.energyCapacity/2) {
        let hurtCreeps = tower.room.find(FIND_MY_CREEPS, {
          filter: c => c.hits < c.hitsMax
        });

        if (hurtCreeps.length) {
          tower.heal(hurtCreeps[0]);
          continue;
        }

        let damagedStructure = tower.room.find(FIND_STRUCTURES, {
          filter: structure => structure.hits < structure.hitsMax &&
                               structure.hits < 50001
        });

        if(damagedStructure.length) {
          tower.repair(damagedStructure.sort((a, b) => b.hitsMax/100*b.hits - a.hitsMax/100*a.hits)[0]);
          continue;
        } else {
          break;
        }
      }
    }
  }
};

module.exports = towers;
