var towers = {

  run: function() {
    let towers = Game.spawns.Spawn1.room.find(FIND_MY_STRUCTURES,
        { filter: { structureType: STRUCTURE_TOWER } }
    );

    for (i = 0; i < towers.length; i++) {
      let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if(closestHostile) tower.attack(closestHostile);

      let closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
          filter: (structure) => structure.hits < structure.hitsMax
      });
      if(closestDamagedStructure) tower.repair(closestDamagedStructure);

      let closestHurtCreep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
          filter: (creep) => creep.hits < creep.hitsMax
      });
      if(closestHurtCreep) tower.heal(closestHurtCreep);
    }
  }
};

module.exports = towers;
