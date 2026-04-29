"use strict";

export const NUM_STEPS = 16;
export const DEFAULT_BPM = 120;

function Track({
    label,
    color,
    instrument,
    defaultSteps,
    volume = 0,
    notes = [],
    randomDensity = null
}) {
    if (!label || typeof label !== "string") {
        throw new Error("label must be non-empty string");
    }
    
    if (!color || typeof color !== "string") {
        throw new Error("color must be a string");
    }
    
    const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    if (!HEX_COLOR_RE.test(color)) {
        throw new Error("Color must be a valid hex color");
    }
    
    if (!instrument || typeof instrument !== "string") {
        throw new Error("instrument must be non-empty string");
    }

    if (!defaultSteps || !Array.isArray(defaultSteps)) {
        throw new Error("defaultSteps is a required parameter");
    }

    if (typeof volume !== "number" || Number.isNaN(volume)) {
        throw new Error("volume must be a number");
    }

    if (!Array.isArray(notes)) {
        throw new Error("notes must be an array");
    }

    if (randomDensity !== null && (typeof randomDensity !== "number" || randomDensity < 0 || randomDensity > 1)) {
        throw new Error("randomDensity must be between 0 and 1");
    }

    defaultSteps.forEach(function (stepIndex) {
        if (!Number.isInteger(stepIndex) || stepIndex < 0 || stepIndex >= NUM_STEPS) {
            throw new Error("defaultSteps must contain valid step indices");
        }
    });

    notes.forEach(function (note) {
        if (typeof note !== "string" || !note) {
            throw new Error("notes must contain non-empty strings");
        }
    });

    return {label, color, instrument, defaultSteps, volume, notes, randomDensity};
}

export const TRACKS = [
    Track({label: "Kick", color: "#f59e0b", instrument: "kick", volume: 0, randomDensity: 0.3, defaultSteps: [0, 4, 8, 12]}),
    Track({label: "Snare", color: "#f43f5e", instrument: "snare", volume: -3, randomDensity: 0.3, defaultSteps: [4, 12]}),
    Track({label: "Closed Hi-Hat", color: "#38bdf8", instrument: "closed-hat", volume: -6, randomDensity: 0.3, defaultSteps: [0, 2, 4, 6, 8, 10, 12, 14]}),
    Track({label: "Open Hi-Hat", color: "#06b6d4", instrument: "open-hat", volume: -6, randomDensity: 0.3, defaultSteps: [6, 14]}),
    Track({label: "Clap", color: "#a78bfa", instrument: "clap", volume: -4, randomDensity: 0.3, defaultSteps: [4, 12]}),
    Track({label: "Tom", color: "#84cc16", instrument: "tom", volume: -2, randomDensity: 0.3, defaultSteps: [7, 15]}),
    Track({
        label: "Bass",
        color: "#10b981",
        instrument: "bass",
        volume: -2,
        notes: ["C2", "C2", "G2", "C2"],
        randomDensity: 0.2,
        defaultSteps: [0, 3, 8, 11]
    }),
    Track({
        label: "Lead",
        color: "#f472b6",
        instrument: "lead",
        volume: -5,
        notes: ["C4", "E4", "G4", "A4", "C5", "A4", "G4", "E4"],
        randomDensity: 0.2,
        defaultSteps: [2, 6, 10, 14]
    })
];

export class Pattern {
    constructor(tracks) {
        this.tracks = tracks;
        this.pattern = tracks.map(() => Array(NUM_STEPS).fill(false));
    }

    static default(tracks = TRACKS) {
        const pattern = new Pattern(tracks);

        pattern.tracks.forEach((track, trackIndex) => {
            track.defaultSteps.forEach(function (stepIndex) {
                pattern.pattern[trackIndex][stepIndex] = true;
            });
        });

        return pattern;
    }

    isOn(trackIndex, stepIndex) {
        return this.pattern[trackIndex][stepIndex];
    }

    setStep(trackIndex, stepIndex, nextValue) {
        if (typeof nextValue !== "boolean") {
            throw new Error("nextValue must be a Boolean");
        }

        this.pattern[trackIndex][stepIndex] = nextValue;
    }

    toggleStep(trackIndex, stepIndex) {
        const nextValue = !this.isOn(trackIndex, stepIndex);
        this.setStep(trackIndex, stepIndex, nextValue);
        return nextValue;
    }

    clear() {
        this.pattern.forEach(function (trackSteps) {
            trackSteps.fill(false);
        });
    }

    randomize() {
        this.tracks.forEach(function (track, trackIndex) {
            const density = track.randomDensity !== null ? track.randomDensity : 0.25;

            for (let stepIndex = 0; stepIndex < NUM_STEPS; stepIndex += 1) {
                this.pattern[trackIndex][stepIndex] = Math.random() < density;
            }
        }, this);
    }

    serialize() {
        return this.pattern.map(function (trackSteps) {
            return trackSteps.slice();
        });
    }

    load(nextPattern) {
        if (!Array.isArray(nextPattern) || nextPattern.length !== this.tracks.length) {
            throw new Error("saved pattern has an invalid track count");
        }

        nextPattern.forEach(function (trackSteps, trackIndex) {
            if (!Array.isArray(trackSteps) || trackSteps.length !== NUM_STEPS) {
                throw new Error("saved pattern has an invalid step count");
            }

            trackSteps.forEach(function (isOn, stepIndex) {
                this.pattern[trackIndex][stepIndex] = Boolean(isOn);
            }, this);
        }, this);
    }
}
