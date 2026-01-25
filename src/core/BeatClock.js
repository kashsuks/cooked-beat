export class BeatClock {
    constructor(bpm = 120) {
        this.bpm = bpm;
        this.beatDuration = 60000 / bpm;
        this.startTime = null;
        this.currentBeat = 0;
    }

    start() {
        this.startTime = performance.now();
    }

    update() {
        if (!this.startTime) {
            return;
        }

        const elapsed = performance.now() - this.startTime;
        this.currentBeat = Math.floor(elapsed / this.beatDuration);
    }

    getBeatProgress() {
        if (!this.startTime) {
            return 0;
        }

        const elapsed = performance.now() - this.startTime;
        return (elapsed % this.beatDuration) / this.beatDuration;
    }

    getElapsedSeconds() {
        if (!this.startTime) {
            return 0;
        }
        
        return (performance.now() - this.startTime) / 1000;
    }

    getCurrentBeat() {
        return this.currentBeat;
    }
}