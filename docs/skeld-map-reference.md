# Johnny Among Us — Skeld map rebuild notes

## Reference set

- Full-map visual reference: [GamesRadar / The Skeld map](https://cdn.mos.cms.futurecdn.net/PBEUgpzBreCHfdChcGfCEh.jpg), credited by GamesRadar to InnerSloth. This is the visual tracing reference, not a production asset.
- Vent IDs and authoritative game-world coordinates: [Among Us Protocol — map-specific IDs](https://github.com/roobscoob/among-us-protocol/blob/master/07_miscellaneous/04_map_specific_ids_for_interactables.md).
- Independent connection cross-check: [Among Us Wiki — The Skeld vents](https://among-us.fandom.com/wiki/The_Skeld).

## Current implementation

- Runtime map constants are separated into `js/skeld-map-data.js`.
- The map still uses the existing 1440 × 870 world coordinate system so the current movement, tasks, repairs, and multiplayer positions are not silently shifted.
- All 14 protocol vent IDs and their original game-world coordinates are stored in `VENT_META`.
- Canvas vent anchors are mapped into the current world space and checked to be walkable.
- Vent connections are isolated into the six actual groups: upper engine/reactor, lower engine/reactor, Electrical/Security/MedBay, Admin/Cafeteria/Hallway, Weapons/upper Navigation, and lower Navigation/Shields.
- Room-edge rendering now uses one wall stroke rather than the previous stack of four thick strokes.

## Accuracy status — important

This is a safe foundation pass, **not a claim that the current map is pixel-perfect**. The existing room/corridor polygons, doors, furniture, task stations, and collision rectangles still need to be traced and calibrated against the visual reference at a fixed scale. Protocol coordinates are exact game-world values; the `canvas` positions in `VENT_META` are provisional mappings into the legacy custom canvas layout, not a measured affine transform.

Run the structural checks with:

```sh
node tests/skeld-map-data.test.js
```

The next geometry pass must update artwork, walkable polygons, door cut-outs, blockers, task/repair stations, and vent anchors together, then compare a same-scale render against the visual reference. Do not adjust only the visible floor and leave collision behind.
