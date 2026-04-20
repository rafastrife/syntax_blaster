/**
 * @fileoverview Main game controller — state, loop, input handling, EMP mechanic.
 * Entry point imported directly by index.html as an ES module.
 */

import { WORDS, C }            from './constants.js';
import { AudioEngine }          from './audio.js';
import { MatrixRain }           from './matrix.js';
import { drawShip }             from './ship.js';
import {
    drawWord,
    fireBullet,
    updateBullets,
    spawnParticles,
    updateParticles,
    EmpWave,
} from './entities.js';
import { drawHUD }              from './hud.js';

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
const audio = new AudioEngine();
let matrix  = null;

// ── Game State factory ───────────────────────────────────────
function makeState() {
    return {
        running:    true,
        score:      0,
        combo:      0,
        maxCombo:   0,
        buffer:     100,       // 0-100 %
        wave:       1,
        waveTimer:  0,
        spawnTimer: 0,
        spawnRate:  2200,      // ms between spawns (decreases per wave)
        words:      [],
        bullets:    [],
        particles:  [],
        empWaves:   [],
        activeWord: null,
        killed:     0,
        laserFlash: 0,         // 0-1, decays each frame
        empCharges: 3,         // ← EMP ability
        ship: { x: canvas.width / 2, y: canvas.height - 70 },
    };
}

let gs          = null;
let animId      = null;
let lastTime    = 0;

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

    // Destroy every visible word, spawn explosion particles for each
    for (const w of gs.words) {
        spawnParticles(gs.particles, w.x, w.y, C.purple, 20);
        spawnParticles(gs.particles, w.x, w.y, C.cyan,    8);
        gs.score  += 5;   // small bonus per cleared word
        gs.killed += 1;
    }
    gs.words      = [];
    gs.activeWord = null;
    gs.combo      = Math.max(0, gs.combo - 1);  // slight penalty: combos reset toward 0

    // Spawn expanding shockwave ring from ship centre
    gs.empWaves.push(new EmpWave(gs.ship.x, gs.ship.y));
}

// ── Damage / Game Over ────────────────────────────────────────
function takeDamage(amount) {
    gs.buffer = Math.max(0, gs.buffer - amount);
    if (gs.buffer <= 0) triggerGameOver();
}

function triggerGameOver() {
    gs.running = false;
    audio.play('gameover');
    document.getElementById('go-score').textContent  = String(gs.score).padStart(6, '0');
    document.getElementById('go-combo').textContent  = gs.maxCombo;
    document.getElementById('go-killed').textContent = gs.killed;
    overlay.classList.add('visible');
}

// ── Main Loop ─────────────────────────────────────────────────
function loop(ts) {
    const dt = Math.min((ts - lastTime) / 1000, 0.1);  // seconds, capped
    lastTime  = ts;
    if (!gs.running) return;

    // Wave progression (every 30 s)
    gs.waveTimer += dt;
    if (gs.waveTimer >= 30) { gs.wave++; gs.waveTimer = 0; }

    // Spawn timing
    gs.spawnTimer += dt;
    const spawnSec = Math.max(0.5, (gs.spawnRate - gs.wave * 60) / 1000);
    if (gs.spawnTimer >= spawnSec) { spawnWord(); gs.spawnTimer = 0; }

    gs.laserFlash  = Math.max(0, gs.laserFlash - dt * 4);
    gs.ship.x      = canvas.width / 2;   // always centred

    // ── Draw ───────────────────────────────────────────────
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    matrix.draw(ctx, dt);

    // EMP shockwaves
    for (let i = gs.empWaves.length - 1; i >= 0; i--) {
        gs.empWaves[i].update(dt);
        gs.empWaves[i].draw(ctx);
        if (gs.empWaves[i].isDead()) gs.empWaves.splice(i, 1);
    }

    // Words
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
    if (!gs.running) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    audio.ensureRunning();  // must be inside user gesture

    // SPACE → EMP
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
            // Correct keystroke
            w.typedIdx++;
            gs.score += 10 + gs.combo;
            audio.play('type');
            fireBullet(gs.bullets, gs.ship, w);
            gs.laserFlash = 1;

            if (w.typedIdx >= w.text.length) {
                // Word destroyed!
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
            // Wrong key
            w.hitFlash = 1;
            gs.combo   = 0;
            audio.play('miss');
        }

    } else {
        // Target selection: find lowest matching word
        let best = null, bestY = -1;
        for (const w of gs.words) {
            if (w.text[0] === key && w.y > bestY) { bestY = w.y; best = w; }
        }

        if (best) {
            gs.activeWord  = best;
            best.active    = true;
            best.typedIdx  = 1;
            gs.score      += 10;
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
});

// ── Init ──────────────────────────────────────────────────────
function initGame() {
    if (animId) cancelAnimationFrame(animId);
    resize();
    overlay.classList.remove('visible');
    matrix   = new MatrixRain(canvas);
    gs       = makeState();
    lastTime = performance.now();
    animId   = requestAnimationFrame(loop);
}

window.addEventListener('resize', () => {
    resize();
    if (matrix) matrix.init(canvas);
    if (gs)     gs.ship.x = canvas.width / 2;
});

document.getElementById('btn-restart').addEventListener('click', initGame);
document.getElementById('btn-exit').addEventListener('click', () => {
    overlay.innerHTML = `
        <p style="color:#00ffff;font-family:'JetBrains Mono',monospace;font-size:22px;letter-spacing:4px">
            SESSION_TERMINATED
        </p>`;
});

// Kick-off
initGame();
