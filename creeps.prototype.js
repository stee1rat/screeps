module.exports = function () {

  Creep.prototype.getEnergy = function() {
    let harvest = () => {
      let source = Game.getObjectById(this.memory.harvesting);

      if (source.energy === 0) {
        return ERR_NOT_ENOUGH_ENERGY;
      }

      let harvest = this.harvest(source);
      if (harvest == ERR_NOT_IN_RANGE) {
        this.moveTo(source, {
            visualizePathStyle: {stroke: '#ffaa00'},
            reusePath: 5
        });
      }
      if (this.carry.energy == this.carryCapacity) {
        this.memory.harvesting = false;
      }
      return OK;
    }

    if (this.memory.harvesting != []._ && this.memory.harvesting) {
      return harvest();
    }

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
      // Get energy from a container or storage
      let source = this.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: structure =>
              (structure.structureType == STRUCTURE_CONTAINER ||
               structure.structureType == STRUCTURE_STORAGE) &&
              structure.store[RESOURCE_ENERGY] > 0
      });

      /*if ((this.role == 'upgrader' || this.role == 'builder') &&
            source === null) {
        source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (structure) => {
            return structure.structureType == STRUCTURE_STORAGE &&
                   structure.store[RESOURCE_ENERGY] > 0
          }
        });
      }*/

      // If there are no energy in containers or on the group and
      // the Creep has WORK body parts then send it harvesting
      if (source === null) {
        if (this.getActiveBodyparts(WORK) > 0) {
          let source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
          if (source) {
            this.memory.harvesting = source.id;
            return harvest();
          } else {
            return null;
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
      return OK;
    }
  };
};
