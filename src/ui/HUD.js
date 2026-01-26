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

        const meterContainer = document.createElement('div');
        meterContainer.id = 'beat-meter-container';
        meterContainer.style.cssText = `
            position: absolute;
            bottom: 35%;
            left: 50%;
            transform: translateX(-50%);
            width: 400px;
        `;

        const meterDiv = document.createElement('div');
        meterDiv.id = 'beat-meter';
        meterDiv.className = 'beat-meter';
        meterDiv.innerHTML = `
            <div class="timing-zone perfect></div>
            <div class="timing-zone good good-left"></div>
            <div class="timing-zone good good-right"></div>
            <div id="beat-arrow" class="beat-arrow"></div>
        `;

        meterContainer.appendChild(meterDiv);
        overlay.appendChild(meterContainer);

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
        const meter = this.container.querySelector('#beat-meter');
        const arrow = this.container.querySelector('#beat-arrow');
        
        if (!meter || !arrow) {
            return;
        }

        const position = beatProgress * 100;
        arrow.style.left = `${position}%`;

        const center = 0.5;
        const dist = Math.abs(beatProgress - center);

        if (dist < 0.1) {
            arrow.style.background = '#22c55e';
        } else if (dist < 0.2) {
            arrow.style.background = '#fbbf24';
        } else {
            arrow.style.background = '#ef4444';
        }
    }
}