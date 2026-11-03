/* Run with: node tests/skeld-map-data.test.js */
const assert = require('node:assert/strict');
global.window = global;
require('../js/skeld-map-data.js');

const map = global.JohnnySkeldMapData;
assert.ok(map, 'Skeld map data module must load');
assert.equal(map.FLOORS.length, 14, 'The Skeld must define all 14 rooms');
assert.equal(map.VENT_META.length, 14, 'The Skeld must define all 14 vents');
assert.equal(map.VENTS.length, 14, 'Runtime vent anchors must match protocol vent IDs');
assert.deepEqual(
  map.VENT_GROUPS,
  [[4,11],[8,9],[3,5,6],[0,1,2],[7,12],[13,10]],
  'Vent groups must match The Skeld connection topology'
);

function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    const crosses = ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-6) + xi);
    if (crosses) inside = !inside;
  }
  return inside;
}
function isWalkable(x, y) {
  return map.FLOORS.some(room => pointInPolygon(x, y, room.p)) ||
    map.HALLS.some(hall => pointInPolygon(x, y, hall));
}

map.VENT_META.forEach((vent, index) => {
  assert.equal(vent.id, index, 'Vent IDs must remain stable and ordered');
  assert.ok(Number.isFinite(vent.protocol[0]) && Number.isFinite(vent.protocol[1]),
    'Protocol vent coordinates must be numeric');
  assert.ok(isWalkable(vent.canvas[0], vent.canvas[1]),
    'Every vent anchor must lie on walkable floor: ' + vent.name);
  vent.links.forEach(target => {
    assert.ok(Number.isInteger(target) && target >= 0 && target < map.VENTS.length,
      'Vent link target must be a valid ID');
    assert.ok(map.VENT_LINKS[target].includes(index),
      'Vent links must be bidirectional: ' + index + ' ↔ ' + target);
    assert.ok(map.VENT_GROUPS.some(group => group.includes(index) && group.includes(target)),
      'A vent cannot connect across separate Skeld networks');
  });
});

console.log('Skeld map-data checks passed: 14 rooms, 14 walkable vent anchors, 6 correctly isolated vent groups.');
