export class GameState {
    constructor() {
        this.score = 0;
        this.combo = 0;
        this.failedOrders = 0;
        this.completedOrders = 0;
        this.state = 'menu'; // menu, playing, results, etc
    }

    reset() {
        this.score = 0;
        this.combo = 0;
        this.failedOrders = 0;
        this.completedOrders = 0;
        this.state = 'playing';
    }

    addScore(points) {
        this.score += points * (this.combo + 1);
    }

    incrementCombo() {
        this.combo++;
    }

    resetCombo() {
        this.combo = 0;
    }

    addFailedOrder() {
        this.failedOrders++;
    }

    addCompletedOrder() {
        this.completedOrders++;
    }

    setState(newState) {
        this.state = newState;
    }
}