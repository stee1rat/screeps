Game.rooms['E58N56'].find(FIND_CONSTRUCTION_SITES).length

Game.rooms['E58N56'].find(FIND_CONSTRUCTION_SITES, {filter: (structure) => {return (structure.structureType == STRUCTURE_ROAD)}}).length

Game.rooms['E58N56'].find(FIND_CONSTRUCTION_SITES, {filter: (structure) => {return (structure.structureType == STRUCTURE_ROAD)}}).map(x => x.remove())

Game.rooms['E58N56'].find(FIND_STRUCTURES, {filter: (structure) => {return (structure.structureType == STRUCTURE_ROAD)}}).map(x => x.destroy())

Game.rooms['E58N56'].findPath(Game.rooms['E58N56'].find(FIND_SOURCES)[0].pos, Game.rooms['E58N56'].find(FIND_MY_SPAWNS)[0].pos);

Game.rooms['E58N56'].findPath(Game.rooms['E58N56'].find(FIND_SOURCES)[0].pos, Game.rooms['E58N56'].find(FIND_MY_SPAWNS)[0].pos).map(p => console.log(p.x, p.y));

Game.rooms['E58N56'].findPath(Game.rooms['E58N56'].find(FIND_SOURCES)[0].pos, Game.rooms['E58N56'].find(FIND_MY_SPAWNS)[0].pos,{ignoreCreeps: true}).map(p =>Game.rooms['E58N56'].createConstructionSite(p.x, p.y, STRUCTURE_ROAD));

Game.rooms['E58N56'].findPath(Game.rooms['E58N56'].find(FIND_SOURCES)[1].pos, Game.rooms['E58N56'].find(FIND_MY_SPAWNS)[0].pos,{ignoreCreeps: true}).map(p =>Game.rooms['E58N56'].createConstructionSite(p.x, p.y, STRUCTURE_ROAD));

Game.rooms['E58N56'].findPath(Game.rooms['E58N56'].controller.pos, Game.rooms['E58N56'].find(FIND_MY_SPAWNS)[0].pos).map(p =>Game.rooms['E58N56'].createConstructionSite(p.x, p.y, STRUCTURE_ROAD));

Game.rooms['E58N56'].findPath(Game.rooms['E58N56'].find(FIND_SOURCES)[1].pos, Game.rooms['E58N56'].controller.pos,{ignoreCreeps: true, ignoreRoads: true}).map(p =>Game.rooms['E58N56'].createConstructionSite(p.x, p.y, STRUCTURE_ROAD));

Game.rooms['E58N56'].findPath(Game.rooms['E58N56'].find(FIND_SOURCES)[0].pos, Game.rooms['E58N56'].controller.pos,{ignoreCreeps: true, ignoreRoads: true}).map(p =>Game.rooms['E58N56'].createConstructionSite(p.x, p.y, STRUCTURE_ROAD));

Game.rooms['E58N56'].createConstructionSite(creep.pos.x, creep.pos.y, STRUCTURE_ROAD)

Game.creeps['Builder2984373'].pos.findClosestByPath(STRUCTURE_SPAWN || STRUCTURE_EXTENSION);

Game.rooms['E58N56'].find(FIND_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_CONTAINER})

Game.map.getTerrainAt(34, 39, Game.creeps['Hauler3043172'].room.name)
Game.map.getTerrainAt(34, 39, Game.creeps['Hauler3043172'].room.name)
Game.creeps['Hauler3043172'].room.lookForAt(LOOK_CREEPS, 23, 41).length
