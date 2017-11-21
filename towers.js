var towers = {

  run: function() {
    _.each(Game.spawns, spawn => {

      const towers = _.filter(spawn.room.find(FIND_MY_STRUCTURES),
        s => s.structureType == STRUCTURE_TOWER);

      _.each(towers, tower => {

        let hostiles = tower.room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length) {
          tower.attack(hostiles[0]);
          return;
        }

        if (tower.energy > tower.energyCapacity/2) {
          let hurtCreeps = tower.room.find(FIND_MY_CREEPS, {
            filter: c => c.hits < c.hitsMax
          });

          if (hurtCreeps.length) {
            tower.heal(hurtCreeps[0]);
            return;
          }

          let damagedStructure = tower.room.find(FIND_STRUCTURES, {
            filter: structure => structure.hits < structure.hitsMax &&
                                 structure.hits < 50001
          });

          if(damagedStructure.length) {
            const repair = tower.repair(damagedStructure.sort((a, b) =>
              b.hitsMax/100*b.hits - a.hitsMax/100*a.hits)[0]);
            console.log('repair result: ' + repair);
            return;
          } else {
            return false;
          }
        }
      });
    });
  }
};

module.exports = towers;
