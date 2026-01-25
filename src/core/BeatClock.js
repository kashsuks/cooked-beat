export class BeatClock {
    constructor(bpm = 120) {
        this.bpm = bpm;
        this.beatDuration = 60000 / bpm;
        this.startTime = null;
        this.currentBeat = 0;

        // metronome (audio)
        this.metronomeEnabled = true;
        this._lastClickBeat = -1;
        this._audioCtx = null;
        this._masterGain = null;
    }

    start() {
        this.startTime = performance.now();
    }

    // Call this after a user gesture (click), or the browser may block audio.
    initAudio() {
        if (this._audioCtx) return;

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this._audioCtx = new AudioCtx();

        this._masterGain = this._audioCtx.createGain();
        this._masterGain.gain.value = 0.08; // volume (0.02–0.15 is reasonable)
        this._masterGain.connect(this._audioCtx.destination);
    }

    setMetronomeEnabled(enabled) {
        this.metronomeEnabled = enabled;
    }

    _playClick() {
        if (!this._audioCtx || !this._masterGain) return;

        const t = this._audioCtx.currentTime;

        // short "click" using oscillator + very fast envelope
        const osc = this._audioCtx.createOscillator();
        const gain = this._audioCtx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(1400, t); // click pitch

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(1.0, t + 0.001);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);

        osc.connect(gain);
        gain.connect(this._masterGain);

        osc.start(t);
        osc.stop(t + 0.035);
    }

    update() {
        if (!this.startTime) return;

        const elapsed = performance.now() - this.startTime;
        this.currentBeat = Math.floor(elapsed / this.beatDuration);

        // Metronome: click exactly when we enter a new beat
        if (this.metronomeEnabled && this._audioCtx && this.currentBeat !== this._lastClickBeat) {
            this._lastClickBeat = this.currentBeat;
            this._playClick();
        }
    }

    getBeatProgress() {
        if (!this.startTime) return 0;

        const elapsed = performance.now() - this.startTime;
        return (elapsed % this.beatDuration) / this.beatDuration;
    }

    getElapsedSeconds() {
        if (!this.startTime) return 0;
        return (performance.now() - this.startTime) / 1000;
    }

    getCurrentBeat() {
        return this.currentBeat;
    }
}