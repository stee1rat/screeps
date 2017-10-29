module.exports = function () {
  Creep.prototype.getEnergy = function() {
    let source = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES,
      { filter: resource => resource.resourceType == RESOURCE_ENERGY }
    );

    if (source !== null) {
      let withdraw = this.pickup(source);
      if (withdraw == ERR_NOT_IN_RANGE) {
        this.moveTo(source, {
          visualizePathStyle: {stroke: '#ffaa00'},
          reusePath: 5
        });
      }
    } else {
      // Get energy from container
      let source = this.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: structure =>
              structure.structureType == STRUCTURE_CONTAINER &&
              structure.store[RESOURCE_ENERGY] > 0
      });

      if (source === null) {
        if (this.getActiveBodyparts(WORK) > 0) {
          let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
          let harvest = creep.harvest(source);
          if (harvest == ERR_NOT_IN_RANGE) {
            creep.moveTo(source, {
                visualizePathStyle: {stroke: '#ffaa00'},
                reusePath: 5
            });
          }
        }
      }

      let withdraw = this.withdraw(source, RESOURCE_ENERGY);
      if (withdraw == ERR_NOT_IN_RANGE) {
        this.moveTo(source, {
          visualizePathStyle: {stroke: '#ffaa00'},
          reusePath: 5
        });
      }
    }
  };
};
