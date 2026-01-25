import { CONFIG } from '../data/config.js';

export class HUD {
    constructor(container) {
        this.container = container;
        this.elements = {};
        this.init();
    }

    init() {
        const overlay = document.createElement('div');
        overlay.className = 'ui-overlay';
        this.container.appendChild(overlay);

        const beatDiv = document.createElement('div');
        beatDiv.id = 'beat-indicator';
        beatDiv.className = 'beat-indicator';
        beatDiv.innerHTML = `<div class="beat-indicator-inner"></div>`;
        overlay.appendChild(beatDiv);

        //display the score
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'hud-score';
        scoreDiv.innerHTML = `
            <div id="score">Score: 0</div>
            <div id="combo" style="color: #666">Combo: 0x</div>
            <div id="failed">Failed: 0/${CONFIG.MAX_FAILED_ORDERS}</div>
        `;
        overlay.appendChild(scoreDiv);

        const timerDiv = document.createElement('div');
        timerDiv.className = 'hud-timer';
        timerDiv.id = 'timer';
        timerDiv.textContent = '3:00';
        overlay.appendChild(timerDiv);

        // orders container
        const ordersDiv = document.createElement('div');
        ordersDiv.id = 'orders-container';
        ordersDiv.style.cssText = 'position: absolute; bottom: 20px; left: 20px';
        overlay.appendChild(ordersDiv);

        //feedback
        const feedbackDiv = document.createElement('div');
        feedbackDiv.id = 'feedback';
        feedbackDiv.className = 'feedback';
        feedbackDiv.style.display = 'none';
        overlay.appendChild(feedbackDiv);

        this.elements = {
            score: document.getElementById('score'),
            combo: document.getElementById('combo'),
            failed: document.getElementById('failed'),
            timer: document.getElementById('timer'),
            orders: document.getElementById('orders-container'),
            feedback: document.getElementById('feedback'),
        };
    }

    updateScore(score) {
        this.elements.score.textContent = `Score: ${score}`;
    }

    updateCombo(combo) {
        this.elements.combo.textContent = `Combo: ${combo}x`;
        this.elements.combo.style.color = combo > 0 ? `#fbbf24` : '#666';
    }

    updateFailed(failed) {
        this.elements.failed.textContent = `Failed: ${failed}/${CONFIG.MAX_FAILED_ORDERS}`;
        this.elements.failed.style.color = failed > 5 ? '#ef4444' : '#fff';
    }

    updateTimer(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        this.elements.timer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    showFeedback(text, type) {
        const colors = {
            PERFECT: '#22c55e',
            GOOD: '#fbbf24',
            MISS: '#ef4444',
            WRONG: '#ef4444'
        };

        this.elements.feedback.textContent = text;
        this.elements.feedback.style.color = colors[type] || '#fff';
        this.elements.feedback.style.display = 'block';

        setTimeout(() => {
            this.elements.feedback.style.display = 'none';
        }, 500);
    }

    updateOrders(orders, currentBeat) {
        this.elements.orders.innerHTML = orders.map(order => {
            const age = currentBeat - order.spawnBeat;
            const patience = Math.max(0, 1 - (age / order.maxBeats));
            const patienceColor = patience > 0.3 ? '#22c55e' : '#ef4444';

            return `
                <div class="order-card">
                <div style="font-size: 1.1rem; font-weight: bold;">${order.dish.name}</div>
                <div style="font-size: 0.9rem; margin-top: 5px;">
                    ${order.steps.map((step, i) => {
                    const color = i < order.currentStep ? '#22c55e' :
                                i === order.currentStep ? '#fbbf24' : '#666';
                    return `<span style="color: ${color}; margin-right: 8px;">${CONFIG.KEY_LABELS[step]}</span>`;
                    }).join('')}
                </div>
                <div class="patience-bar">
                    <div class="patience-fill" style="width: ${patience * 100}%; background: ${patienceColor};"></div>
                </div>
                </div>
            `;
            }).join('');
    }

    updateBeat(beatProgress) {
        const center = 0.5;
        const dist = Math.abs(beatProgress - center);

        //make it pulse stronger at the center
        const strength = Math.max(0, 1 - (dist / 0.5));

        const inner = this.container.querySelector('#beat-indicator .beat-indicator-inner');
        if (!inner) {
            return;
        }

        const scale = 0.85 + strength * 0.35;
        inner.style.transform = `scale(${scale})`;
        inner.style.opacity = `${0.25 + strength * 0.75}`;
    }
}