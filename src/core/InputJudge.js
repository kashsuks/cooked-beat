import { CONFIG } from '../data/config.js';

export class InputJudge {
    judge(beatProgess) {
        const center = 0.5;
        const distance = Math.abs(beatProgess - center);

        if (distance < CONFIG.TIMING_WINDOWS.perfect) {
            return 'PERFECT';
        }
        
        if (distance < CONFIG.TIMING_WINDOWS.good) {
            return 'GOOD';
        }

        return 'MISS';
    }
}