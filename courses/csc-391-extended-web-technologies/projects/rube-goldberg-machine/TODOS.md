# Rube Goldberg Machine Todos

- [x] Confirm click event on button
- [x] Trigger scissors close on click
- [x] Smooth scissors rotation (no snap)
- [x] Remove duplicate scissors id

- [ ] Offset scissors blades (avoid z-fighting)
- [ ] Rotate scissors around base pivot (parent entity pivot)

- [ ] Validate button color feedback cycle

- [ ] Add rope break trigger
- [ ] Build 2-part rope (top + bottom cylinders)
- [ ] Split rope on scissors close (separate segments)
- [ ] Add ball drop trigger
- [ ] Drop ball after rope cut (delay after closeScissors)
- [ ] Make ball look attached to rope-bottom (position/spacing)
- [ ] Parent ball under rope-bottom
- [ ] Animate rope-bottom drop (ball follows)
- [ ] Start ball slightly higher for clearer drop
- [ ] Add plate tilt trigger
- [ ] Add plate entity under ball path
- [ ] Trigger plate tilt when ball drop completes
- [ ] Tune plate position/rotation so ball appears to hit it
- [ ] Add domino fall trigger
- [ ] Add domino-1 entity near plate
- [ ] Trigger domino-1 when plate tilt completes
- [ ] Add domino-2 entity behind domino-1
- [ ] Trigger domino-2 when domino-1 falls
- [ ] Tune domino spacing/angles for a convincing hit
- [ ] Add gate open trigger
- [ ] Add bell ring trigger

## Replace scissors box with GLB/GLTF

- [ ] Add model file (e.g., assets/models/scissors.glb)
- [ ] Register it in a-assets with a-asset-item
- [ ] Replace the a-box scissors entity with a-gltf-model
- [ ] Wrap model in a parent a-entity to control pivot/rotation cleanly
- [ ] Re-apply animation__close to the parent (rotate parent, not the mesh)
- [ ] Tune position/scale/rotation so it lines up with the rope
- [ ] If the GLB includes its own animations: add animation-mixer and trigger via events
