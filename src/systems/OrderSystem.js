import { DISHES } from '../data/dishes.js';
import { CONFIG } from '../data/config.js';

export class OrderSystem {
    constructor() {
        this.orders = [];
        this.nextOrderId = 0;
    }

    canSpawnOrder() {
        return this.orders.length < CONFIG.MAX_ACTIVE_ORDERS;
    }

    spawnOrder(currentBeat) {
        if (!this.canSpawnOrder()) {
            return null;
        }

        const dishKeys = Object.keys(DISHES);
        const dishKey = dishKeys[Math.floor(Math.random() * dishKeys.length)];
        const dish = DISHES[dishKey];

        const order = {
            id: this.nextOrderId++,
            dishKey,
            dish,
            steps: [...dish.steps],
            currentStep: 0,
            missCount: 0,
            spawnBeat: currentBeat,
            maxBeats: dish.patienceBeats,
            state: 'active', // active, completed, burnt, expired
        };

        this.orders.push(order);
        return order;
    }


    processAction(action, judgment, currentBeat) {
        for (let order of this.orders) {
            if (order.state !== 'active') {
                continue;
            }

            const expectedAction = order.steps[order.currentStep];

            if (expectedAction === action) {
                return this.handleCorrectAction(order, judgment);
            }
        }

        return { success: false, reason: 'wrong_action' };
    }

    handleCorrectAction(order, judgment) {
        if (judgment === 'MISS') {
            order.missCount++;

            if (order.missCount > order.dish.missTolerance) {
                order.state = 'burnt';
                return { success: false, reason: 'burnt', order }; 
            }

            return { success: false, reason: 'miss', order};
        }

        // good or a perfect hit
        order.currentStep++;

        if (order.currentStep >= order.steps.length) {
            order.state = 'completed';
            return { success: true, completed: true, order, judgment};
        }

        return { success: true, completed: false, order, judgment };
    }

    updateOrders(currentBeat) {
        const expired = [];
        const completed = [];
        const burnt = [];

        this.orders = this.orders.filter(order => {
            const age = currentBeat - order.spawnBeat;

            if (order.state === 'completed') {
                completed.push(order);
                return false;
            }

            if (order.state === 'burnt') {
                burnt.push(order);
                return false;
            }

            if (age > order.maxBeats) {
                order.state = 'expired';
                expired.push(order);
                return false;
            }

            return true;
        });

        return { expired, completed, burnt };
    }

    getActiveOrders() {
        return this.orders.filter(o => o.state === 'active');
    }

    getPatience(order, currentBeat) {
        const age = currentBeat - order.spawnBeat;
        return Math.max(0, 1 - (age / order.maxBeats));
    }

    clear() {
        this.orders = [];
    }
}