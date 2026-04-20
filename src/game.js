/**
 * @fileoverview Main game controller — state, loop, input, EMP and leaderboard.
 */

import { WORDS, C }                          from './constants.js';
import { AudioEngine }                        from './audio.js';
import { MatrixRain }                         from './matrix.js';
import { drawShip }                           from './ship.js';
import {
    drawWord, fireBullet, updateBullets,
    spawnParticles, updateParticles, EmpWave,
} from './entities.js';
import { drawHUD }                            from './hud.js';
import {
    isConfigured, getTopScores, submitScore, subscribeRealtime,
} from './leaderboard.js';
import { NameInputController }               from './nameInput.js';

// ── Canvas ───────────────────────────────────────────────────
const canvas  = document.getElementById('game-canvas');
const ctx     = canvas.getContext('2d');
const overlay = document.getElementById('overlay');

function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();

// ── Singletons ───────────────────────────────────────────────
const audio     = new AudioEngine();
const nameInput = new NameInputController(document.getElementById('name-overlay'));
let   matrix    = null;
let   unsubRealtime = () => {};

// ── Leaderboard rendering ────────────────────────────────────

/**
 * Render the leaderboard list inside the given container.
 * @param {Array|null} scores   null → show loading spinner.
 * @param {number}     [highlightScore]  Current player's score for highlighting.
 * @param {string}     [targetId='leaderboard-list']
 */
function renderLeaderboard(scores, highlightScore = null, targetId = 'leaderboard-list') {
    const el = document.getElementById(targetId);
    if (!el) return;

    if (scores === null) {
        el.innerHTML = '<p class="lb-status">// CONNECTING TO MAINFRAME...</p>';
        return;
    }

    if (!isConfigured()) {
        el.innerHTML = `
            <p class="lb-status lb-warn">// LEADERBOARD OFFLINE</p>
            <p class="lb-status lb-dim">Configure Supabase keys in<br>src/leaderboard.js to enable.</p>`;
        return;
    }

    if (scores.length === 0) {
        el.innerHTML = `
            <p class="lb-status lb-dim">// NO RECORDS FOUND</p>
            <p class="lb-status lb-dim">Be the first to hack the kernel.</p>`;
        return;
    }

    el.innerHTML = scores.map((s, i) => {
        const isYou = highlightScore !== null && s.score === highlightScore;
        const dots  = '.'.repeat(Math.max(4, 20 - s.name.length - String(s.score).length));
        return `
            <div class="lb-row${isYou ? ' lb-you' : ''}">
                <span class="lb-rank">${String(i + 1).padStart(2, '0')}.</span>
                <span class="lb-name">${s.name}</span>
                <span class="lb-dots">${dots}</span>
                <span class="lb-score">${String(s.score).padStart(6, '0')}</span>
                <span class="lb-wave">W${String(s.wave).padStart(2, '0')}</span>
                ${isYou ? '<span class="lb-you-tag">◀ YOU</span>' : ''}
            </div>`;
    }).join('');
}

// ── Game State factory ───────────────────────────────────────
function makeState() {
    return {
        running:    true,
        score:      0,
        combo:      0,
        maxCombo:   0,
        buffer:     100,
        wave:       1,
        waveTimer:  0,
        spawnTimer: 0,
        spawnRate:  2200,
        words:      [],
        bullets:    [],
        particles:  [],
        empWaves:   [],
        activeWord: null,
        killed:     0,
        laserFlash: 0,
        empCharges: 3,
        ship: { x: canvas.width / 2, y: canvas.height - 70 },
    };
}

let gs       = null;
let animId   = null;
let lastTime = 0;
let scene    = 'menu'; // 'menu', 'game', 'gameover', 'leaderboard'

// ── Spawn ────────────────────────────────────────────────────
function spawnWord() {
    const text  = WORDS[Math.floor(Math.random() * WORDS.length)];
    const speed = (20 + Math.random() * 25 + gs.wave * 3) * (canvas.height / 8000);
    const x     = 80 + Math.random() * (canvas.width - 160);
    gs.words.push({ text, typedIdx: 0, x, y: -40, speed, active: false, hitFlash: 0 });
}

// ── EMP ──────────────────────────────────────────────────────
function activateEMP() {
    if (gs.empCharges <= 0 || gs.words.length === 0) return;
    gs.empCharges--;
    audio.play('emp');

    for (const w of gs.words) {
        spawnParticles(gs.particles, w.x, w.y, C.purple, 20);
        spawnParticles(gs.particles, w.x, w.y, C.cyan, 8);
        gs.score  += 5;
        gs.killed += 1;
    }
    gs.words      = [];
    gs.activeWord = null;
    gs.combo      = Math.max(0, gs.combo - 1);
    gs.empWaves.push(new EmpWave(gs.ship.x, gs.ship.y));
}

// ── Damage ───────────────────────────────────────────────────
function takeDamage(amount) {
    gs.buffer = Math.max(0, gs.buffer - amount);
    if (gs.buffer <= 0) triggerGameOver();
}

// ── Game Over (async — handles leaderboard flow) ─────────────
async function triggerGameOver() {
    gs.running = false;
    scene = 'gameover';
    audio.play('gameover');

    // Fill base stats
    document.getElementById('go-score').textContent  = String(gs.score).padStart(6, '0');
    document.getElementById('go-combo').textContent  = gs.maxCombo;
    document.getElementById('go-killed').textContent = gs.killed;

    // Show overlay with loading leaderboard
    overlay.classList.add('visible');
    renderLeaderboard(null);

    // Fetch current top 10
    const scores = await getTopScores();
    renderLeaderboard(scores, gs.score > 0 ? gs.score : null);

    // Check if player qualifies for top 10
    const qualifies = gs.score > 0 &&
        (scores.length < 10 || gs.score > (scores[scores.length - 1]?.score ?? 0));

    if (qualifies) {
        // Show arcade name input
        const name = await nameInput.prompt(gs.score);

        // Write to Supabase
        await submitScore({ name, score: gs.score, wave: gs.wave });

        // Refresh leaderboard with the new entry highlighted
        const updated = await getTopScores();
        renderLeaderboard(updated, gs.score);
    }

    // Start realtime listener while player is on game over screen
    unsubRealtime();
    unsubRealtime = subscribeRealtime((fresh) => renderLeaderboard(fresh, gs.score));
}

// ── Main Loop ─────────────────────────────────────────────────
function loop(ts) {
    const dt = Math.min((ts - lastTime) / 1000, 0.1);
    lastTime  = ts;

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (matrix) matrix.draw(ctx, dt);

    if (scene !== 'game' || !gs || !gs.running) {
        animId = requestAnimationFrame(loop);
        return;
    }

    gs.waveTimer += dt;
    if (gs.waveTimer >= 30) { gs.wave++; gs.waveTimer = 0; }

    gs.spawnTimer += dt;
    const spawnSec = Math.max(0.5, (gs.spawnRate - gs.wave * 60) / 1000);
    if (gs.spawnTimer >= spawnSec) { spawnWord(); gs.spawnTimer = 0; }

    gs.laserFlash = Math.max(0, gs.laserFlash - dt * 4);
    gs.ship.x     = canvas.width / 2;

    for (let i = gs.empWaves.length - 1; i >= 0; i--) {
        gs.empWaves[i].update(dt);
        gs.empWaves[i].draw(ctx);
        if (gs.empWaves[i].isDead()) gs.empWaves.splice(i, 1);
    }

    for (let i = gs.words.length - 1; i >= 0; i--) {
        const w = gs.words[i];
        w.y += w.speed * (dt * 60);
        if (w.y > canvas.height - 55) {
            spawnParticles(gs.particles, w.x, canvas.height - 55, C.red, 12);
            audio.play('damage');
            takeDamage(20);
            gs.combo = 0;
            if (gs.activeWord === w) gs.activeWord = null;
            gs.words.splice(i, 1);
            continue;
        }
        drawWord(ctx, w);
    }

    updateBullets(ctx, gs.bullets, gs.ship, dt);
    updateParticles(ctx, gs.particles, dt);
    drawShip(ctx, gs.ship, gs.laserFlash);
    drawHUD(ctx, gs, canvas);

    animId = requestAnimationFrame(loop);
}

// ── Input ─────────────────────────────────────────────────────
window.addEventListener('keydown', (e) => {
    if (scene !== 'game' || !gs || !gs.running) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    audio.ensureRunning();

    if (e.code === 'Space') {
        e.preventDefault();
        activateEMP();
        return;
    }

    if (e.key.length !== 1) return;
    const key = e.key.toUpperCase();

    if (gs.activeWord) {
        const w = gs.activeWord;
        if (w.text[w.typedIdx] === key) {
            w.typedIdx++;
            gs.score += 10 + gs.combo;
            audio.play('type');
            fireBullet(gs.bullets, gs.ship, w);
            gs.laserFlash = 1;

            if (w.typedIdx >= w.text.length) {
                gs.combo++;
                gs.killed++;
                if (gs.combo > gs.maxCombo) gs.maxCombo = gs.combo;
                spawnParticles(gs.particles, w.x, w.y, C.cyan, 24);
                audio.play('destroy');
                gs.words.splice(gs.words.indexOf(w), 1);
                gs.activeWord = null;
                gs.laserFlash = 0;
            }
        } else {
            w.hitFlash = 1;
            gs.combo   = 0;
            audio.play('miss');
        }

    } else {
        let best = null, bestY = -1;
        for (const w of gs.words) {
            if (w.text[0] === key && w.y > bestY) { bestY = w.y; best = w; }
        }

        if (best) {
            gs.activeWord = best;
            best.active   = true;
            best.typedIdx = 1;
            gs.score     += 10;
            if (gs.combo > gs.maxCombo) gs.maxCombo = gs.combo;
            audio.play('lock');
            fireBullet(gs.bullets, gs.ship, best);
            gs.laserFlash = 1;

            if (best.text.length === 1) {
                gs.combo++;
                gs.killed++;
                spawnParticles(gs.particles, best.x, best.y, C.cyan, 24);
                audio.play('destroy');
                gs.words.splice(gs.words.indexOf(best), 1);
                gs.activeWord = null;
                gs.laserFlash = 0;
            }
        } else {
            gs.combo = 0;
            audio.play('miss');
        }
    }
}, { capture: false });

// ── Menu / Init Flow ──────────────────────────────────────────
const menuOverlay = document.getElementById('main-menu-overlay');
const lbOverlay   = document.getElementById('leaderboard-overlay');

function showMenu() {
    scene = 'menu';
    overlay.classList.remove('visible');
    lbOverlay.classList.remove('visible');
    menuOverlay.classList.add('visible');
    
    if (!animId) {
        matrix   = new MatrixRain(canvas);
        lastTime = performance.now();
        animId   = requestAnimationFrame(loop);
    }
}

async function showLeaderboardScreen() {
    scene = 'leaderboard';
    menuOverlay.classList.remove('visible');
    lbOverlay.classList.add('visible');
    
    renderLeaderboard(null, null, 'screen-leaderboard-list');
    const scores = await getTopScores();
    renderLeaderboard(scores, null, 'screen-leaderboard-list');
    
    unsubRealtime();
    unsubRealtime = subscribeRealtime((fresh) => {
        renderLeaderboard(fresh, null, 'screen-leaderboard-list');
    });
}

function initGame() {
    scene = 'game';
    unsubRealtime();
    unsubRealtime = () => {};

    resize();
    overlay.classList.remove('visible');
    menuOverlay.classList.remove('visible');
    lbOverlay.classList.remove('visible');
    
    renderLeaderboard(null);
    if (!matrix) matrix = new MatrixRain(canvas);
    gs       = makeState();
    lastTime = performance.now();
    if (!animId) animId = requestAnimationFrame(loop);
}

window.addEventListener('resize', () => {
    resize();
    if (matrix) matrix.init(canvas);
    if (gs)     gs.ship.x = canvas.width / 2;
});

// UI Embed listeners
document.getElementById('btn-menu-start').addEventListener('click', () => {
    audio.ensureRunning();
    initGame();
});
document.getElementById('btn-menu-leaderboard').addEventListener('click', showLeaderboardScreen);
document.getElementById('btn-lb-back').addEventListener('click', () => {
    unsubRealtime();
    showMenu();
});

document.getElementById('btn-restart').addEventListener('click', initGame);
document.getElementById('btn-exit').addEventListener('click', () => {
    unsubRealtime();
    showMenu();
});

// Kick-off by showing the Menu
showMenu();
