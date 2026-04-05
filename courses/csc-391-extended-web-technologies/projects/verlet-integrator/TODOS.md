# Verlet Integrator TODOs

## Project Status
- [x] Milestone 0: Confirm the p5 starter
- [x] Milestone 1: Create one particle type
- [x] Milestone 2: First Verlet motion
- [x] Milestone 3: Add gravity
- [x] Milestone 4: Add bounds with clamping
- [x] Milestone 5: Connect two particles with one stick
- [x] Milestone 6: Add a pinned particle
- [x] Milestone 7: Expand to a short chain
- [x] Milestone 8: Add multiple solver passes
- [x] Milestone 9: Core stabilization and modularity pass
- [x] Milestone 10: Add mouse interaction
- [x] Milestone 11: Add reset and debug view
- [x] Milestone 12: Add bounce as a refinement
- [x] Milestone 13: Introduce `builders.js`
- [x] Milestone 14: Extend to cloth

## Completed Learning Record

### [x] Milestone 0: Confirm the p5 starter
- Implemented:
  `index.html` loads p5, creates the canvas container, and the sketch renders a live frame every draw cycle.
- What to observe:
  The page renders immediately and the canvas updates every frame.

### [x] Milestone 1: Create one particle type
- Implemented:
  `js/verlet-core.js` defines `VParticle` with current position, previous position, radius, mass, bounds, and pinned state.
- What to observe:
  The simulation stores motion state in particle objects instead of mixing it directly into the sketch.

### [x] Milestone 2: First Verlet motion
- Implemented:
  `VParticle.integrate()` updates position from `current - previous`, which creates implicit velocity.
- What to observe:
  Motion comes from position history, not from a separate velocity property.

### [x] Milestone 3: Add gravity
- Implemented:
  `VerletSystem` stores a gravity vector and applies it during particle integration.
- What to observe:
  Free particles drift downward because gravity is part of the integration step.

### [x] Milestone 4: Add bounds with clamping
- Implemented:
  `VParticle.constrain()` keeps particles inside the canvas and respects their radius.
- What to observe:
  Particles remain fully visible instead of clipping through the edges.

### [x] Milestone 5: Connect two particles with one stick
- Implemented:
  `VDistanceConstraint` maintains a rest length between two particles, and the sketch draws the link as a line.
- What to observe:
  Constraint solving keeps connected particles near a fixed distance apart.

### [x] Milestone 6: Add a pinned particle
- Implemented:
  Particles can be pinned, and pinned or dragged particles are treated as locked by the solver.
- What to observe:
  Anchored points stay fixed while the rest of the system reacts around them.

### [x] Milestone 7: Expand to a short chain
- Implemented:
  `buildChainScene()` constructs a multi-particle chain instead of a single stick demo.
- What to observe:
  The system behaves like a rope rather than disconnected links.

### [x] Milestone 8: Add multiple solver passes
- Implemented:
  `VerletSystem.step()` runs all constraints for a configurable number of iterations each frame.
- What to observe:
  More solver passes make the chain and cloth feel stiffer and less stretchy.

### [x] Milestone 9: Core stabilization and modularity pass
- Implemented:
  `VerletSystem` now owns global simulation order, constraints solve one pass at a time, incoming state is cloned, and rendering happens from one consistent frame state.
- What to observe:
  The project structure is cleaner and easier to extend without hiding important logic.

### [x] Milestone 10: Add mouse interaction
- Implemented:
  The sketch can find the nearest particle, lock it while dragging, and release it cleanly.
- What to observe:
  Dragging reshapes the chain or cloth without destroying the simulation.

### [x] Milestone 11: Add reset and debug view
- Implemented:
  `R` rebuilds the current scene and `D` toggles a more diagnostic view of constraints and particles.
- What to observe:
  Debug mode makes internal structure easier to study, especially for cloth.

### [x] Milestone 12: Add bounce as a refinement
- Implemented:
  Boundary handling now supports bounce by modifying previous-position state after clamping to the wall.
- What to observe:
  Impacts against the canvas edges reflect motion instead of only stopping it.

### [x] Milestone 13: Introduce `builders.js`
- Implemented:
  Scene construction now lives in `js/builders.js`, which keeps `js/sketch.js` focused on p5 lifecycle, input, and drawing.
- What to observe:
  Chain and cloth setup are reusable scene builders instead of inline setup code.

### [x] Milestone 14: Extend to cloth
- Implemented:
  `buildClothScene()` creates a particle grid with structural and diagonal shear constraints, and the sketch supports keyboard switching between chain and cloth using `1` and `2`.
- What to observe:
  The same solver core supports both 1D and 2D soft-body behavior.

## Controls
- Mouse drag: move the nearest particle
- `1`: switch to chain
- `2`: switch to cloth
- `R`: reset the current scene
- `D`: toggle debug view

## Suggested Next Explorations
- [ ] Add touch interaction
- [ ] Add on-page sliders for gravity, bounce, or solver iterations
- [ ] Add bend constraints for richer cloth behavior
- [ ] Add tearing or cutting
- [ ] Add obstacle collisions
