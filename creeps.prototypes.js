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
      // Container energy
      let source = this.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: structure =>
              structure.structureType == STRUCTURE_CONTAINER &&
              structure.store[RESOURCE_ENERGY] > 0
      });

      // If nothing found return null
      if (source === null) {
        return null;
      }

      let withdraw = this.withdraw(source, RESOURCE_ENERGY);
      if (withdraw == ERR_NOT_IN_RANGE) {
        this.moveTo(source, {
          visualizePathStyle: {stroke: '#ffaa00'},
          reusePath: 5
        });
      }
    }
    return OK;
  };
};
