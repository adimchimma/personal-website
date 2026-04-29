"use strict";

const sequencerEl = document.getElementById("sequencer");
const playBtn = document.getElementById("play-btn");
const stopBtn = document.getElementById("stop-btn");
const bpmSlider = document.getElementById("bpm-slider");
const bpmDisplay = document.getElementById("bpm-display");
const swingSlider = document.getElementById("swing-slider");
const swingDisplay = document.getElementById("swing-display");
const stepCounter = document.getElementById("step-counter");
const randomizeBtn = document.getElementById("randomize-btn");
const clearBtn = document.getElementById("clear-btn");
const saveBtn = document.getElementById("save-btn");
const loadBtn = document.getElementById("load-btn");
const reverbMixInput = document.getElementById("reverb-mix");
const reverbVal = document.getElementById("reverb-val");
const delayMixInput = document.getElementById("delay-mix");
const delayVal = document.getElementById("delay-val");
const masterVolInput = document.getElementById("master-vol");
const volVal = document.getElementById("vol-val");

function createElement(tagName, className, textContent) {
    const element = document.createElement(tagName);

    if (className) {
        element.className = className;
    }

    if (typeof textContent === "string") {
        element.textContent = textContent;
    }

    return element;
}

function buildBeatLabels(gridElement) {
    const row = createElement("div", "beat-labels");

    row.innerHTML = [
        "<div></div><div></div>",
        '<div class="beat-labels-inner">',
        '<div class="beat-label">BEAT 1</div>',
        '<div class="beat-label">BEAT 2</div>',
        '<div class="beat-label">BEAT 3</div>',
        '<div class="beat-label">BEAT 4</div>',
        "</div>"
    ].join("");

    gridElement.appendChild(row);
}

export function constructSequencerUI({
    tracks,
    pattern,
    stepCount,
    mutedTracks = [],
    bpm = 120,
    swing = 0,
    reverbMix = 0.15,
    delayMix = 0,
    masterVolume = -6,
    onToggleStep,
    onToggleMute,
    onPlayPause,
    onStop,
    onTempoChange,
    onSwingChange,
    onRandomize,
    onClear,
    onSave,
    onLoad,
    onReverbChange,
    onDelayChange,
    onMasterVolumeChange
}) {
    sequencerEl.replaceChildren();
    buildBeatLabels(sequencerEl);

    const stepButtons = new Array(tracks.length);
    const muteButtons = new Array(tracks.length);
    let currentStep = null;

    tracks.forEach((track, trackIndex) => {
        const row = createElement("div", "track");
        const label = createElement("div", "track-label", track.label);

        row.appendChild(label);

        const muteBtn = createElement("button", "mute-btn", "M");

        muteBtn.type = "button";
        muteBtn.title = "Mute " + track.label;
        muteBtn.setAttribute("aria-label", "Mute " + track.label);
        row.appendChild(muteBtn);

        muteButtons[trackIndex] = muteBtn;
        muteBtn.addEventListener("click", function () {
            const nextMuted = !muteBtn.classList.contains("muted");

            onToggleMute(trackIndex, nextMuted);
            muteBtn.classList.toggle("muted", nextMuted);
        });

        const stepsEl = createElement("div", "steps");

        stepButtons[trackIndex] = [];
        for (let stepIndex = 0; stepIndex < stepCount; stepIndex += 1) {
            const button = createElement("button", "step");
            const isOn = pattern.isOn(trackIndex, stepIndex);

            button.type = "button";
            button.style.setProperty("--track-color", track.color);
            button.setAttribute("aria-label", "Toggle " + track.label + " step " + (stepIndex + 1));
            button.title = track.label + " step " + (stepIndex + 1);

            if (isOn) {
                button.classList.add("on");
            }

            button.addEventListener("click", function () {
                const nextValue = !pattern.isOn(trackIndex, stepIndex);

                onToggleStep(trackIndex, stepIndex, nextValue);
                button.classList.toggle("on", nextValue);
            });

            stepsEl.appendChild(button);
            stepButtons[trackIndex][stepIndex] = button;
        }

        row.appendChild(stepsEl);
        sequencerEl.appendChild(row);
    });

    playBtn.addEventListener("click", function () {
        onPlayPause();
    });

    stopBtn.addEventListener("click", function () {
        onStop();
    });

    bpmSlider.addEventListener("input", function () {
        const nextTempo = Number(bpmSlider.value);

        setTempo(nextTempo);
        onTempoChange(nextTempo);
    });

    swingSlider.addEventListener("input", function () {
        const nextSwing = Number(swingSlider.value);

        setSwing(nextSwing);
        onSwingChange(nextSwing);
    });

    randomizeBtn.addEventListener("click", function () {
        onRandomize();
    });

    clearBtn.addEventListener("click", function () {
        onClear();
    });

    saveBtn.addEventListener("click", function () {
        onSave();
    });

    loadBtn.addEventListener("click", function () {
        onLoad();
    });

    reverbMixInput.addEventListener("input", function () {
        const nextMix = Number(reverbMixInput.value);

        setReverbMix(nextMix);
        onReverbChange(nextMix);
    });

    delayMixInput.addEventListener("input", function () {
        const nextMix = Number(delayMixInput.value);

        setDelayMix(nextMix);
        onDelayChange(nextMix);
    });

    masterVolInput.addEventListener("input", function () {
        const nextVolume = Number(masterVolInput.value);

        setMasterVolume(nextVolume);
        onMasterVolumeChange(nextVolume);
    });

    function setPlaybackState(isPlaying) {
        playBtn.textContent = isPlaying ? "⏸" : "▶";
        playBtn.classList.toggle("playing", isPlaying);
        playBtn.setAttribute("aria-pressed", String(isPlaying));
    }

    function setCurrentStep(stepIndex) {
        if (currentStep !== null) {
            stepButtons.forEach(function (trackRow) {
                trackRow[currentStep].classList.remove("playhead");
            });
        }

        stepButtons.forEach(function (trackRow) {
            trackRow[stepIndex].classList.add("playhead");
        });

        currentStep = stepIndex;
        stepCounter.textContent = (stepIndex + 1) + " / " + stepCount;
    }

    function clearCurrentStep() {
        if (currentStep !== null) {
            stepButtons.forEach(function (trackRow) {
                trackRow[currentStep].classList.remove("playhead");
            });
        }

        currentStep = null;
        stepCounter.textContent = "–";
    }

    function syncPattern(nextPattern) {
        tracks.forEach(function (_, trackIndex) {
            for (let stepIndex = 0; stepIndex < stepCount; stepIndex += 1) {
                stepButtons[trackIndex][stepIndex].classList.toggle(
                    "on",
                    nextPattern.isOn(trackIndex, stepIndex)
                );
            }
        });
    }

    function setTempo(nextTempo) {
        bpmSlider.value = String(nextTempo);
        bpmDisplay.textContent = nextTempo + " BPM";
    }

    function setSwing(nextSwing) {
        swingSlider.value = String(nextSwing);
        swingDisplay.textContent = Math.round(nextSwing * 100) + "%";
    }

    function setTrackMuted(trackIndex, isMuted) {
        muteButtons[trackIndex].classList.toggle("muted", isMuted);
    }

    function setReverbMix(nextMix) {
        reverbMixInput.value = String(nextMix);
        reverbVal.textContent = Math.round(nextMix * 100) + "%";
    }

    function setDelayMix(nextMix) {
        delayMixInput.value = String(nextMix);
        delayVal.textContent = Math.round(nextMix * 100) + "%";
    }

    function setMasterVolume(nextVolume) {
        masterVolInput.value = String(nextVolume);
        volVal.textContent = nextVolume + " dB";
    }

    mutedTracks.forEach(function (isMuted, trackIndex) {
        setTrackMuted(trackIndex, isMuted);
    });

    setTempo(bpm);
    setSwing(swing);
    setReverbMix(reverbMix);
    setDelayMix(delayMix);
    setMasterVolume(masterVolume);
    setPlaybackState(false);
    clearCurrentStep();

    return {
        stepButtons,
        muteButtons,
        clearCurrentStep,
        setCurrentStep,
        setDelayMix,
        setMasterVolume,
        setPlaybackState,
        setReverbMix,
        setSwing,
        setTempo,
        setTrackMuted,
        syncPattern
    };
}
