import { BeatClock } from './core/BeatClock.js';
import { InputJudge } from './core/InputJudge.js';
import { GameState } from './core/GameState.js';
import { OrderSystem } from './systems/OrderSystem.js';
import { ScoringSystem } from './systems/ScoringSystem.js';
import { KitchenScene } from './scenes/KitchenScene.js';

import { HUD } from './ui/HUD.js';
import { CONFIG } from './data/config.js';

class BeatKitchenGame {
  constructor() {
    this.container = document.getElementById('game-container');
    this.gameState = new GameState();
    this.clock = new BeatClock(CONFIG.BPM);
    this.judge = new InputJudge();
    this.orderSystem = new OrderSystem();
    this.scoringSystem = new ScoringSystem(this.gameState);
    this.kitchenScene = new KitchenScene();
    this.hud = null;
    
    this.lastSpawnBeat = -1;
    this.animationId = null;
    
    this.showMenu();
  }

  showMenu() {
    this.container.innerHTML = `
      <div class="menu-screen">
        <h1 style="font-size: 4rem; margin: 0; color: #f59e0b;"> Cooked Beat </h1>
        <p style="font-size: 1.2rem; margin: 20px 0;">Cook on the beat. Survive the rush.</p>
        <div style="margin: 30px 0; font-size: 1rem; line-height: 1.8;">
          <div><strong>A</strong> - Chop | <strong>S</strong> - Stir | <strong>D</strong> - Flip | <strong>SPACE</strong> - Serve</div>
          <div style="margin-top: 10px; opacity: 0.7;">Hit keys on the beat. Complete orders before time runs out!</div>
        </div>
        <button class="btn-primary" id="start-btn">START SHIFT</button>
      </div>
    `;
    
    document.getElementById('start-btn').addEventListener('click', () => this.startGame());
  }

  startGame() {
    this.container.innerHTML = '';
    this.gameState.reset();
    this.orderSystem.clear();
    this.clock = new BeatClock(CONFIG.BPM);
    this.lastSpawnBeat = -1;
    
    this.kitchenScene.init(this.container);
    this.hud = new HUD(this.container);
    
    this.clock.start();
    this.setupInput();
    this.gameLoop();
  }

  setupInput() {
    this.handleKeyPress = (e) => {
      const key = e.key.toUpperCase();
      
      for (let [action, actionKey] of Object.entries(CONFIG.ACTION_KEYS)) {
        if (actionKey === key || (action === 'serve' && key === ' ')) {
          this.processAction(action);
          break;
        }
      }
    };
    
    window.addEventListener('keydown', this.handleKeyPress);
  }

  processAction(action) {
    const beatProgress = this.clock.getBeatProgress();
    const judgment = this.judge.judge(beatProgress);
    const result = this.orderSystem.processAction(action, judgment, this.clock.getCurrentBeat());

    if (!result.success) {
      if (result.reason === 'wrong_action') {
        this.scoringSystem.processMiss();
        this.hud.showFeedback('WRONG ACTION!', 'WRONG');
      } else if (result.reason === 'burnt') {
        this.kitchenScene.setDishBurnt(result.order.id);
        this.hud.showFeedback('BURNT!', 'MISS');
      } else {
        this.scoringSystem.processMiss();
        this.hud.showFeedback(judgment + '!', judgment);
      }
    } else {
      const points = this.scoringSystem.processHit(
        judgment,
        result.completed ? result.order.dish.reward : 0
      );
      
      if (result.completed) {
        this.gameState.addCompletedOrder();
        this.kitchenScene.removeDishIndicator(result.order.id);
      }
      
      this.hud.showFeedback(judgment + '!', judgment);
    }

    this.updateHUD();
  }

  gameLoop() {
    this.animationId = requestAnimationFrame(() => this.gameLoop());
    
    this.clock.update();
    const currentBeat = this.clock.getCurrentBeat();

    // spawn orders
    if (currentBeat % CONFIG.SPAWN_INTERVAL_BEATS === 0 && currentBeat !== this.lastSpawnBeat) {
      this.lastSpawnBeat = currentBeat;
      const order = this.orderSystem.spawnOrder(currentBeat);
      if (order) {
        const stationIndex = this.orderSystem.getActiveOrders().length - 1;
        this.kitchenScene.addDishIndicator(order.id, order.dish.color, stationIndex);
      }
    }

    //update orders
    const { expired, burnt } = this.orderSystem.updateOrders(currentBeat);
    
    expired.forEach(order => {
      this.gameState.addFailedOrder();
      this.kitchenScene.removeDishIndicator(order.id);
    });
    
    burnt.forEach(order => {
      this.gameState.addFailedOrder();
      this.kitchenScene.removeDishIndicator(order.id);
    });

    const elapsed = this.clock.getElapsedSeconds();
    const timeLeft = Math.max(0, CONFIG.SHIFT_DURATION - elapsed);
    
    if (timeLeft <= 0 || this.gameState.failedOrders >= CONFIG.MAX_FAILED_ORDERS) {
      this.endGame();
      return;
    }

    this.updateHUD();
    this.kitchenScene.animate();
    this.kitchenScene.render();
  }

  updateHUD() {
    this.hud.updateScore(this.gameState.score);
    this.hud.updateCombo(this.gameState.combo);
    this.hud.updateFailed(this.gameState.failedOrders);
    
    const timeLeft = Math.ceil(CONFIG.SHIFT_DURATION - this.clock.getElapsedSeconds());
    this.hud.updateTimer(timeLeft);
    
    this.hud.updateOrders(this.orderSystem.getActiveOrders(), this.clock.getCurrentBeat());
  }

  endGame() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('keydown', this.handleKeyPress);
    this.kitchenScene.dispose();
    
    this.showResults();
  }

  showResults() {
    const rating = this.gameState.failedOrders < 5 ? 'EXCELLENT!' :
                   this.gameState.failedOrders < 8 ? 'GOOD JOB!' : 'SURVIVED!';
    const ratingColor = this.gameState.failedOrders < 5 ? '#22c55e' :
                        this.gameState.failedOrders < 8 ? '#fbbf24' : '#ef4444';

    this.container.innerHTML = `
      <div class="results-screen">
        <h1 style="font-size: 3rem; margin: 0;">SHIFT COMPLETE!</h1>
        <div style="font-size: 2rem; margin: 30px 0;">Final Score: ${this.gameState.score}</div>
        <div style="font-size: 1.2rem; margin-bottom: 30px;">
          <div>Failed Orders: ${this.gameState.failedOrders}</div>
          <div style="margin-top: 10px; color: ${ratingColor};">${rating}</div>
        </div>
        <button class="btn-primary" id="retry-btn">RETRY SHIFT</button>
      </div>
    `;
    
    document.getElementById('retry-btn').addEventListener('click', () => this.startGame());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new BeatKitchenGame();
});