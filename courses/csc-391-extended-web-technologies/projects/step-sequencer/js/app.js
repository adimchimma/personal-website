"use strict";

import { StepSequencerAudioEngine } from "./audio.js";
import { DEFAULT_BPM, NUM_STEPS, Pattern, TRACKS } from "./data.js";
import { constructSequencerUI } from "./ui.js";

const STORAGE_KEY = "step-sequencer-pattern";
const pattern = Pattern.default(TRACKS);
const mutedTracks = TRACKS.map(function () {
    return false;
});
let ui = null;

const audioEngine = new StepSequencerAudioEngine({
    tracks: TRACKS,
    pattern,
    bpm: DEFAULT_BPM,
    onStepChange(stepIndex) {
        if (ui) {
            ui.setCurrentStep(stepIndex);
        }
    }
});

function handleToggleStep(trackIndex, stepIndex, nextValue) {
    pattern.setStep(trackIndex, stepIndex, nextValue);
}

function handleToggleMute(trackIndex, nextValue) {
    mutedTracks[trackIndex] = nextValue;
    audioEngine.setMuted(trackIndex, nextValue);
}

async function handlePlayPause() {
    if (audioEngine.isPlaying()) {
        audioEngine.pause();
        ui.setPlaybackState(false);
        return;
    }

    await audioEngine.start();
    ui.setPlaybackState(true);
}

function handleStop() {
    audioEngine.stop();
    ui.setPlaybackState(false);
    ui.clearCurrentStep();
}

function handleTempoChange(nextTempo) {
    audioEngine.setTempo(nextTempo);
}

function handleSwingChange(nextSwing) {
    audioEngine.setSwing(nextSwing);
}

function handleRandomize() {
    pattern.randomize();
    ui.syncPattern(pattern);
}

function handleClear() {
    pattern.clear();
    ui.syncPattern(pattern);
}

function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pattern.serialize()));
    alert("Pattern saved!");
}

function handleLoad() {
    const savedPattern = localStorage.getItem(STORAGE_KEY);

    if (!savedPattern) {
        alert("No saved pattern found.");
        return;
    }

    try {
        pattern.load(JSON.parse(savedPattern));
        ui.syncPattern(pattern);
    } catch (error) {
        alert("Saved pattern is invalid.");
    }
}

function handleReverbChange(nextMix) {
    audioEngine.setReverbMix(nextMix);
}

function handleDelayChange(nextMix) {
    audioEngine.setDelayMix(nextMix);
}

function handleMasterVolumeChange(nextVolume) {
    audioEngine.setMasterVolume(nextVolume);
}

ui = constructSequencerUI({
    tracks: TRACKS,
    pattern,
    stepCount: NUM_STEPS,
    mutedTracks,
    bpm: DEFAULT_BPM,
    swing: audioEngine.getSwing(),
    reverbMix: audioEngine.getReverbMix(),
    delayMix: audioEngine.getDelayMix(),
    masterVolume: audioEngine.getMasterVolume(),
    onToggleStep: handleToggleStep,
    onToggleMute: handleToggleMute,
    onPlayPause: handlePlayPause,
    onStop: handleStop,
    onTempoChange: handleTempoChange,
    onSwingChange: handleSwingChange,
    onRandomize: handleRandomize,
    onClear: handleClear,
    onSave: handleSave,
    onLoad: handleLoad,
    onReverbChange: handleReverbChange,
    onDelayChange: handleDelayChange,
    onMasterVolumeChange: handleMasterVolumeChange
});
