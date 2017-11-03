var towers = {

  run: function() {
    let towers = Game.spawns.Spawn1.room.find(FIND_MY_STRUCTURES,
        { filter: { structureType: STRUCTURE_TOWER } }
    );

    let towersLength = towers.length;
    for (let i = 0; i < towersLength; i++) {
      let tower = towers[i];

      let hostiles = tower.room.find(FIND_HOSTILE_CREEPS);
      console.log(hostiles);
      if (hostiles && hostiles.length) {
        tower.attack(hostile[0]);
        return;
      }

      if (tower.energy > tower.energyCapacity/2) {
        let hurtCreeps = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: creep => creep.hits < creep.hitsMax
        });
        if(hurtCreeps && hurtCreeps.length) {
          tower.heal(hurtCreeps[0]);
          return;
        }

        let damagedStructure = tower.room.find(FIND_STRUCTURES, {
          filter: structure => structure.hits < structure.hitsMax &&
                               structure.hits < 50001
        });
        if(damagedStructure && damagedStructure.length) {
          tower.repair(damagedStructure[0]);
          return;
        }
      }
    }
  }
};

module.exports = towers;
