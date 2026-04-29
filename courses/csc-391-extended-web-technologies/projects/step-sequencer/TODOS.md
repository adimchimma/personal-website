# Step Sequencer TODOs

## Project Status
- [x] Build the modular static site shell
- [x] Create a shared track and pattern model in `js/data.js`
- [x] Render the grid from reusable UI code in `js/ui.js`
- [x] Add a dark sequencer theme inspired by the original one-file version
- [x] Implement transport, tempo, swing, and playhead behavior
- [x] Add an 8-track Tone.js audio engine in `js/audio.js`
- [x] Add track mute, randomize, clear, save, and load controls
- [x] Add master reverb, delay, and volume controls

## File Responsibilities
- `index.html`
  Owns the static layout, control IDs, and script loading.
- `css/styles.css`
  Owns layout, dark theme styling, grid presentation, and control states.
- `js/data.js`
  Owns constants, track definitions, and the `Pattern` state model.
- `js/ui.js`
  Owns DOM rendering, button wiring, and visual updates such as the playhead.
- `js/audio.js`
  Owns Tone.js synths, the transport sequence, track channels, and master effects.
- `js/app.js`
  Owns app-level orchestration between state, UI, audio, and local storage.

## Rebuild Order
1. Start with the HTML shell and empty sequencer container.
2. Add CSS so the grid and controls have a clear layout.
3. Define track data and a `Pattern` class.
4. Render the 16-step grid from the data model.
5. Let step buttons toggle pattern state.
6. Add a Tone.js voice for each instrument type.
7. Schedule the transport with `Tone.Sequence`.
8. Sync playhead updates from the audio clock back into the DOM.
9. Add transport controls, then tempo and swing.
10. Add mute, randomize, save/load, and effects.

## Final Feature Checklist
- [x] 8 tracks
- [x] 16 steps
- [x] Toggleable step grid
- [x] Play / pause
- [x] Stop and reset
- [x] Tempo slider
- [x] Swing slider
- [x] Current-step display
- [x] Track mute buttons
- [x] Randomize pattern
- [x] Clear pattern
- [x] Save/load pattern with `localStorage`
- [x] Reverb mix
- [x] Delay mix
- [x] Master volume

## Suggested Next Explorations
- [ ] Add keyboard shortcuts for transport
- [ ] Add multiple pattern slots
- [ ] Add per-track volume controls
- [ ] Add a visual beat-group label row
- [ ] Add downloadable preset export/import
