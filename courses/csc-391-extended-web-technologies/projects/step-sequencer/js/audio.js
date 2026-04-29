"use strict";

import { DEFAULT_BPM, NUM_STEPS } from "./data.js";

const ToneLib = window.Tone;

if (!ToneLib) {
    throw new Error("Tone.js must be loaded before audio.js");
}

function createChannel(track, output) {
    return new ToneLib.Channel({
        volume: track.volume
    }).connect(output);
}

function createKickVoice(track, output) {
    const channel = createChannel(track, output);
    const synth = new ToneLib.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 8,
        envelope: {
            attack: 0.001,
            decay: 0.35,
            sustain: 0,
            release: 0.1
        }
    });

    synth.connect(channel);

    return {
        channel,
        trigger(time) {
            synth.triggerAttackRelease("C1", "8n", time);
        },
        reset() {
        }
    };
}

function createSnareVoice(track, output) {
    const channel = createChannel(track, output);
    const synth = new ToneLib.NoiseSynth({
        noise: {
            type: "white"
        },
        envelope: {
            attack: 0.001,
            decay: 0.18,
            sustain: 0,
            release: 0.05
        }
    });

    synth.connect(channel);

    return {
        channel,
        trigger(time) {
            synth.triggerAttackRelease("16n", time);
        },
        reset() {
        }
    };
}

function createClosedHatVoice(track, output) {
    const channel = createChannel(track, output);
    const synth = new ToneLib.MetalSynth({
        frequency: 400,
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
        envelope: {
            attack: 0.001,
            decay: 0.06,
            release: 0.01
        }
    });

    synth.connect(channel);

    return {
        channel,
        trigger(time) {
            synth.triggerAttackRelease("32n", time);
        },
        reset() {
        }
    };
}

function createOpenHatVoice(track, output) {
    const channel = createChannel(track, output);
    const synth = new ToneLib.MetalSynth({
        frequency: 400,
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
        envelope: {
            attack: 0.001,
            decay: 0.4,
            release: 0.1
        }
    });

    synth.connect(channel);

    return {
        channel,
        trigger(time) {
            synth.triggerAttackRelease("8n", time);
        },
        reset() {
        }
    };
}

function createClapVoice(track, output) {
    const channel = createChannel(track, output);
    const synth = new ToneLib.NoiseSynth({
        noise: {
            type: "pink"
        },
        envelope: {
            attack: 0.005,
            decay: 0.12,
            sustain: 0,
            release: 0.05
        }
    });

    synth.connect(channel);

    return {
        channel,
        trigger(time) {
            synth.triggerAttackRelease("16n", time);
        },
        reset() {
        }
    };
}

function createTomVoice(track, output) {
    const channel = createChannel(track, output);
    const synth = new ToneLib.MembraneSynth({
        pitchDecay: 0.12,
        octaves: 4,
        envelope: {
            attack: 0.001,
            decay: 0.25,
            sustain: 0,
            release: 0.1
        }
    });

    synth.connect(channel);

    return {
        channel,
        trigger(time) {
            synth.triggerAttackRelease("G1", "8n", time);
        },
        reset() {
        }
    };
}

function createBassVoice(track, output) {
    const channel = createChannel(track, output);
    const synth = new ToneLib.Synth({
        oscillator: {
            type: "triangle"
        },
        envelope: {
            attack: 0.01,
            decay: 0.3,
            sustain: 0.1,
            release: 0.1
        }
    });
    let noteIndex = 0;

    synth.connect(channel);

    return {
        channel,
        trigger(time) {
            const note = track.notes[noteIndex % track.notes.length];

            noteIndex += 1;
            synth.triggerAttackRelease(note, "8n", time);
        },
        reset() {
            noteIndex = 0;
        }
    };
}

function createLeadVoice(track, output) {
    const channel = createChannel(track, output);
    const synth = new ToneLib.Synth({
        oscillator: {
            type: "sawtooth"
        },
        envelope: {
            attack: 0.02,
            decay: 0.1,
            sustain: 0.4,
            release: 0.2
        }
    });
    let noteIndex = 0;

    synth.connect(channel);

    return {
        channel,
        trigger(time) {
            const note = track.notes[noteIndex % track.notes.length];

            noteIndex += 1;
            synth.triggerAttackRelease(note, "16n", time);
        },
        reset() {
            noteIndex = 0;
        }
    };
}

function createTrackVoice(track, output) {
    switch (track.instrument) {
        case "kick":
            return createKickVoice(track, output);
        case "snare":
            return createSnareVoice(track, output);
        case "closed-hat":
            return createClosedHatVoice(track, output);
        case "open-hat":
            return createOpenHatVoice(track, output);
        case "clap":
            return createClapVoice(track, output);
        case "tom":
            return createTomVoice(track, output);
        case "bass":
            return createBassVoice(track, output);
        case "lead":
            return createLeadVoice(track, output);
        default:
            throw new Error("Unsupported instrument: " + track.instrument);
    }
}

export class StepSequencerAudioEngine {
    constructor({tracks, pattern, bpm = DEFAULT_BPM, onStepChange = function () {}}) {
        this.tracks = tracks;
        this.pattern = pattern;
        this.onStepChange = onStepChange;

        this.masterVolume = new ToneLib.Volume(-6).toDestination();
        this.reverb = new ToneLib.Reverb({
            decay: 2.5,
            wet: 0.15
        }).connect(this.masterVolume);
        this.delay = new ToneLib.FeedbackDelay({
            delayTime: "8n",
            feedback: 0.3,
            wet: 0
        }).connect(this.reverb);

        this.voices = tracks.map(function (track) {
            return createTrackVoice(track, this.delay);
        }, this);

        ToneLib.Transport.bpm.value = bpm;
        ToneLib.Transport.swing = 0;
        ToneLib.Transport.swingSubdivision = "16n";

        this.sequence = new ToneLib.Sequence(function (time, stepIndex) {
            this.playStep(stepIndex, time);
            ToneLib.getDraw().schedule(function () {
                this.onStepChange(stepIndex);
            }.bind(this), time);
        }.bind(this), Array.from({length: NUM_STEPS}, function (_, index) {
            return index;
        }), "16n");

        this.sequence.start(0);
    }

    async start() {
        await ToneLib.start();
        ToneLib.Transport.start();
    }

    pause() {
        ToneLib.Transport.pause();
    }

    stop() {
        ToneLib.Transport.stop();
        this.resetVoices();
    }

    isPlaying() {
        return ToneLib.Transport.state === "started";
    }

    setTempo(nextTempo) {
        ToneLib.Transport.bpm.value = nextTempo;
    }

    getTempo() {
        return Math.round(ToneLib.Transport.bpm.value);
    }

    setSwing(nextSwing) {
        ToneLib.Transport.swing = nextSwing;
        ToneLib.Transport.swingSubdivision = "16n";
    }

    getSwing() {
        return ToneLib.Transport.swing;
    }

    setMuted(trackIndex, isMuted) {
        this.voices[trackIndex].channel.mute = isMuted;
    }

    setReverbMix(nextMix) {
        this.reverb.wet.value = nextMix;
    }

    getReverbMix() {
        return this.reverb.wet.value;
    }

    setDelayMix(nextMix) {
        this.delay.wet.value = nextMix;
    }

    getDelayMix() {
        return this.delay.wet.value;
    }

    setMasterVolume(nextVolume) {
        this.masterVolume.volume.value = nextVolume;
    }

    getMasterVolume() {
        return this.masterVolume.volume.value;
    }

    playStep(stepIndex, time) {
        this.tracks.forEach(function (_, trackIndex) {
            if (this.pattern.isOn(trackIndex, stepIndex)) {
                this.voices[trackIndex].trigger(time);
            }
        }, this);
    }

    resetVoices() {
        this.voices.forEach(function (voice) {
            voice.reset();
        });
    }
}
