var towers = {

  run: function() {
    let towers = Game.spawns.Spawn1.room.find(FIND_MY_STRUCTURES,
        { filter: { structureType: STRUCTURE_TOWER } }
    );

    for (i = 0; i < towers.length; i++) {
      let tower = towers[i];

      let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if (closestHostile) {
        tower.attack(closestHostile);
        return OK;
      }

      if (tower.energy > tower.energyCapacity / 2) {
        let closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax &&
               structure.hits < 50001
        });
        if(closestDamagedStructure) tower.repair(closestDamagedStructure);

        let closestHurtCreep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: (creep) => creep.hits < creep.hitsMax
        });
        if(closestHurtCreep) tower.heal(closestHurtCreep);
      }
    }
  }
};

module.exports = towers;
