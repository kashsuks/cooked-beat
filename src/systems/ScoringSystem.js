import { CONFIG } from '../data/config.js';

export class ScoringSystem {
    constructor(gameState) {
        this.gameState = gameState;
    }

    processHit(judgment, dishReward = 0) {
        const basePoints = CONFIG.SCORING[judgment.toLowerCase()] || 0;

        if (judgment === 'MISS') {
            this.gameState.resetCombo();
            return 0;
        }

        this.gameState.incrementCombo();
        const points = basePoints + dishReward;
        this.gameState.addScore(points);

        return points * (this.gameState.combo);
    }

    processMiss() {
        this.gameState.resetCombo();
    }
}