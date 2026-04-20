/* ============================================================
   SYNTAX BLASTER — Full Canvas Game Engine
   ============================================================ */

'use strict';

// ── Canvas Setup ────────────────────────────────────────────
const canvas  = document.getElementById('game-canvas');
const ctx     = canvas.getContext('2d');
const overlay = document.getElementById('overlay');

function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); initGame(); });

// ── Audio Engine (Web Audio API) ────────────────────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx   = null;

function ensureAudio() {
    if (!audioCtx) audioCtx = new AudioCtx();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

/**
 * Synthesised sounds — no external files needed
 */
function playSound(type) {
    ensureAudio();
    const t = audioCtx.currentTime;

    switch (type) {
        case 'type': {
            // Short blip: high-pass sine
            const osc  = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.type = 'square';
            osc.frequency.setValueAtTime(800 + Math.random() * 400, t);
            gain.gain.setValueAtTime(0.07, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
            osc.start(t); osc.stop(t + 0.07);
            break;
        }
        case 'destroy': {
            // Laser zap: frequency sweep down
            const osc  = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1400, t);
            osc.frequency.exponentialRampToValueAtTime(200, t + 0.18);
            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
            osc.start(t); osc.stop(t + 0.19);
            break;
        }
        case 'miss': {
            // Low buzz error
            const osc  = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.type = 'square';
            osc.frequency.setValueAtTime(120, t);
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
            osc.start(t); osc.stop(t + 0.13);
            break;
        }
        case 'damage': {
            // Rumble + noise burst
            const buf  = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.25, audioCtx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
            const src  = audioCtx.createBufferSource();
            const gain = audioCtx.createGain();
            src.buffer = buf;
            src.connect(gain); gain.connect(audioCtx.destination);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
            src.start(t);
            break;
        }
        case 'gameover': {
            // Descending tritone
            [440, 330, 220, 110].forEach((freq, i) => {
                const osc  = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.type = 'sawtooth';
                const start = t + i * 0.18;
                osc.frequency.setValueAtTime(freq, start);
                gain.gain.setValueAtTime(0.15, start);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);
                osc.start(start); osc.stop(start + 0.31);
            });
            break;
        }
        case 'lock': {
            // Target acquired beep
            const osc  = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, t);
            osc.frequency.setValueAtTime(1600, t + 0.06);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
            osc.start(t); osc.stop(t + 0.13);
            break;
        }
    }
}

// ── Constants & Word List ───────────────────────────────────
const WORDS = [
    'FUNCTION','ASYNC','PROMISE','KERNEL','BUFFER','THREAD',
    'SYSTEM','MEMORY','POINTER','ARRAY','OBJECT','MODULE',
    'COMPILE','DEBUG','CACHE','PAYLOAD','SOCKET','OVERFLOW',
    'BITWISE','STRUCT','RETURN','VOID','STATIC','MALLOC',
    'PROCESS','THREAD','SIGNAL','MUTEX','DAEMON','FORK',
    'PARSE','REGEX','STACK','HEAP','BINARY','HEXDUMP',
];

// Colour palette
const C = {
    bg:        '#05050a',
    grid:      '#0d0d18',
    matrixGrn: '#00ff41',
    cyan:      '#00ffff',
    red:       '#ff003c',
    purple:    '#ae81ff',
    white:     '#e0e0e0',
    dimWhite:  'rgba(224,224,224,0.5)',
    hud:       '#00ff41',
};

// ── Game State ───────────────────────────────────────────────
let gs;

function makeState() {
    return {
        running:     true,
        score:       0,
        combo:       0,
        maxCombo:    0,
        buffer:      100,
        wave:        1,
        waveTimer:   0,
        spawnTimer:  0,
        spawnRate:   2200,
        words:       [],
        bullets:     [],
        particles:   [],
        activeWord:  null,
        killed:      0,
        laserFlash:  0,       // glow intensity (0-1, decays)
        ship: {
            x: canvas.width / 2,
            y: canvas.height - 70,
        },
    };
}

// ── Matrix Rain ──────────────────────────────────────────────
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
const matrixCols   = [];
const COL_W        = 18;

function initMatrix() {
    matrixCols.length = 0;
    const cols = Math.ceil(canvas.width / COL_W);
    for (let i = 0; i < cols; i++) {
        matrixCols.push({
            x:      i * COL_W,
            y:      Math.random() * -canvas.height,
            speed:  40 + Math.random() * 80,
            len:    8  + Math.floor(Math.random() * 20),
            chars:  [],
        });
    }
}

function drawMatrix(dt) {
    for (const col of matrixCols) {
        col.y += col.speed * dt;
        // Regenerate when off screen
        if (col.y - col.len * COL_W > canvas.height) {
            col.y     = -COL_W * col.len;
            col.speed = 40 + Math.random() * 80;
        }
        // Draw column
        for (let i = 0; i < col.len; i++) {
            const gy   = col.y - i * COL_W;
            if (gy < 0 || gy > canvas.height) continue;
            const alpha = (i === 0) ? 0.9 : Math.max(0, 0.25 - i * 0.015);
            const ch    = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
            ctx.fillStyle = i === 0
                ? `rgba(200,255,200,${alpha})`
                : `rgba(0,255,65,${alpha})`;
            ctx.font = `${COL_W - 2}px 'JetBrains Mono'`;
            ctx.fillText(ch, col.x, gy);
        }
    }
}

// ── Ship Drawing ─────────────────────────────────────────────
function drawShip(ship, laserFlash) {
    const { x, y } = ship;

    ctx.save();
    ctx.translate(x, y);

    const glow = 0.6 + laserFlash * 0.4;

    // Engine glow
    const eng = ctx.createRadialGradient(0, 18, 2, 0, 18, 30);
    eng.addColorStop(0, `rgba(0,255,255,${0.6 * glow})`);
    eng.addColorStop(1, 'rgba(0,255,255,0)');
    ctx.fillStyle = eng;
    ctx.beginPath();
    ctx.ellipse(0, 22, 10, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Thruster exhaust flicker
    const exhaust = 12 + Math.random() * 10;
    ctx.strokeStyle = `rgba(0,255,255,${0.5 + Math.random() * 0.4})`;
    ctx.lineWidth   = 2;
    ctx.beginPath(); ctx.moveTo(-5, 14); ctx.lineTo(0, 14 + exhaust);   ctx.stroke();
    ctx.beginPath(); ctx.moveTo( 5, 14); ctx.lineTo(0, 14 + exhaust);   ctx.stroke();

    // Ship hull (geometric triangle)
    ctx.shadowBlur  = 20 * glow;
    ctx.shadowColor = C.cyan;
    ctx.strokeStyle = C.cyan;
    ctx.lineWidth   = 2;
    ctx.fillStyle   = 'rgba(0,24,32,0.85)';
    ctx.beginPath();
    ctx.moveTo(0, -24);  // nose
    ctx.lineTo(18, 14);  // right wing
    ctx.lineTo(10, 8);   // right inner
    ctx.lineTo(0, 12);   // bottom centre
    ctx.lineTo(-10, 8);  // left inner
    ctx.lineTo(-18, 14); // left wing
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit
    ctx.fillStyle   = `rgba(0,255,255,${0.4 * glow})`;
    ctx.shadowBlur  = 10;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(7, 4);
    ctx.lineTo(-7, 4);
    ctx.closePath();
    ctx.fill();

    // Wing stripe
    ctx.strokeStyle = `rgba(174,129,255,${0.7 * glow})`;
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.moveTo(-18,14); ctx.lineTo(-10, 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo( 18,14); ctx.lineTo( 10, 8); ctx.stroke();

    ctx.restore();
}

// ── Enemy (Word) Entities ───────────────────────────────────
function spawnWord() {
    const text  = WORDS[Math.floor(Math.random() * WORDS.length)];
    const speed = (20 + Math.random() * 25 + gs.wave * 3) * (canvas.height / 8000);
    const x     = 80 + Math.random() * (canvas.width - 160);
    gs.words.push({ text, typedIdx: 0, x, y: -40, speed, active: false, hitFlash: 0 });
}

function drawWord(w) {
    const fsize  = 15;
    const padding= { x: 16, y: 10 };
    ctx.font     = `bold ${fsize}px 'JetBrains Mono'`;

    const measured = ctx.measureText(w.text);
    const bw       = measured.width + padding.x * 2;
    const bh       = fsize + padding.y * 2;
    const bx       = w.x - bw / 2;
    const by       = w.y - bh / 2;

    const borderC  = w.active ? C.cyan  : C.dimWhite;
    const glowC    = w.active ? C.cyan  : 'rgba(200,200,200,0.4)';
    const bgAlpha  = w.active ? 0.25    : 0.15;

    // Hit flash red overlay
    if (w.hitFlash > 0) {
        ctx.save();
        ctx.globalAlpha = w.hitFlash;
        ctx.fillStyle = C.red;
        ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
        ctx.restore();
        w.hitFlash = Math.max(0, w.hitFlash - 0.12);
    }

    // Box
    ctx.save();
    ctx.shadowBlur  = w.active ? 18 : 5;
    ctx.shadowColor = glowC;
    ctx.strokeStyle = borderC;
    ctx.lineWidth   = w.active ? 1.5 : 1;
    ctx.fillStyle   = `rgba(5,5,10,${bgAlpha})`;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeRect(bx, by, bw, bh);

    // Diamond indicator (active)
    if (w.active) {
        const ds = 6;
        ctx.fillStyle = C.cyan;
        ctx.beginPath();
        ctx.moveTo(w.x, by - 4 - ds);
        ctx.lineTo(w.x + ds, by - 4);
        ctx.lineTo(w.x, by - 4 + ds);
        ctx.lineTo(w.x - ds, by - 4);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();

    // Text characters
    let cx = bx + padding.x;
    for (let i = 0; i < w.text.length; i++) {
        const ch = w.text[i];
        if (i < w.typedIdx) {
            // Typed = dim / faded
            ctx.fillStyle = 'rgba(255,0,60,0.35)';
            ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
        } else if (w.active) {
            // Remaining active = bright cyan
            ctx.fillStyle   = C.cyan;
            ctx.shadowColor = C.cyan;
            ctx.shadowBlur  = 8;
        } else {
            ctx.fillStyle   = C.white;
            ctx.shadowColor = 'rgba(255,255,255,0.4)';
            ctx.shadowBlur  = 3;
        }
        ctx.font = `bold ${fsize}px 'JetBrains Mono'`;
        ctx.fillText(ch, cx, by + padding.y + fsize - 3);
        cx += ctx.measureText(ch).width;
    }
    ctx.shadowBlur = 0;
}

// ── Bullet (laser projectile) ────────────────────────────────
function fireBullet(target) {
    gs.bullets.push({
        x:    gs.ship.x,
        y:    gs.ship.y - 24,
        tx:   target.x,
        ty:   target.y,
        life: 1,       // 0 = dead
        target,
    });
}

function drawBullets(dt) {
    for (let i = gs.bullets.length - 1; i >= 0; i--) {
        const b = gs.bullets[i];
        // Advance toward target
        const dx = b.tx - b.x;
        const dy = b.ty - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const speed = Math.min(dist, 900 * dt);
        if (dist < 6) {
            // Reached target, remove
            gs.bullets.splice(i, 1);
            continue;
        }
        b.x += (dx / dist) * speed;
        b.y += (dy / dist) * speed;
        b.life = Math.max(0, b.life - dt * 3);

        // Draw laser dot
        const grd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 5);
        grd.addColorStop(0, 'rgba(255,255,255,1)');
        grd.addColorStop(0.3, `rgba(0,255,255,${b.life})`);
        grd.addColorStop(1, 'rgba(0,255,255,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Trail line from ship to bullet
        ctx.save();
        ctx.globalAlpha  = b.life * 0.4;
        ctx.strokeStyle  = C.cyan;
        ctx.lineWidth    = 1.5;
        ctx.shadowBlur   = 10;
        ctx.shadowColor  = C.cyan;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(gs.ship.x, gs.ship.y - 24);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.restore();
    }
}

// ── Particles ───────────────────────────────────────────────
function spawnParticles(x, y, color, count = 18) {
    for (let i = 0; i < count; i++) {
        const angle  = Math.random() * Math.PI * 2;
        const speed  = 30 + Math.random() * 100;
        gs.particles.push({
            x, y,
            vx:  Math.cos(angle) * speed,
            vy:  Math.sin(angle) * speed,
            life: 1,
            size: 1.5 + Math.random() * 3,
            color,
            text: Math.random() > 0.5
                ? String.fromCharCode(65 + Math.floor(Math.random() * 26))
                : String(Math.floor(Math.random() * 10)),
        });
    }
}

function updateDrawParticles(dt) {
    for (let i = gs.particles.length - 1; i >= 0; i--) {
        const p = gs.particles[i];
        p.x    += p.vx * dt;
        p.y    += p.vy * dt;
        p.life -= dt * 2;
        if (p.life <= 0) { gs.particles.splice(i, 1); continue; }

        ctx.save();
        ctx.globalAlpha = p.life;
        if (Math.random() > 0.5) {
            // Text particle
            ctx.fillStyle   = p.color;
            ctx.font        = `${p.size + 8}px 'JetBrains Mono'`;
            ctx.shadowBlur  = 8;
            ctx.shadowColor = p.color;
            ctx.fillText(p.text, p.x, p.y);
        } else {
            // Dot particle
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

// ── HUD ─────────────────────────────────────────────────────
function drawHUD() {
    const pad = 18;
    ctx.font = `bold 14px 'JetBrains Mono'`;

    // Score — top left
    ctx.fillStyle   = C.hud;
    ctx.shadowColor = C.hud;
    ctx.shadowBlur  = 8;
    ctx.fillText(`SCORE: ${String(gs.score).padStart(6,'0')}`, pad, pad + 14);

    // Wave — top right
    const waveStr = `WAVE: ${gs.wave}`;
    const ww = ctx.measureText(waveStr).width;
    ctx.fillText(waveStr, canvas.width - ww - pad, pad + 14);

    // Combo — top centre
    if (gs.combo > 1) {
        ctx.font      = `bold 16px 'JetBrains Mono'`;
        ctx.fillStyle = C.purple;
        ctx.shadowColor = C.purple;
        const comboStr = `COMBO ×${gs.combo}`;
        const cw = ctx.measureText(comboStr).width;
        ctx.fillText(comboStr, (canvas.width - cw) / 2, pad + 16);
    }

    // Buffer bar — bottom
    const barW  = 260;
    const barH  = 8;
    const barX  = (canvas.width - barW) / 2;
    const barY  = canvas.height - 28;

    ctx.shadowBlur = 0;
    ctx.fillStyle  = '#111';
    ctx.fillRect(barX, barY, barW, barH);

    const hp      = gs.buffer / 100;
    const barFill = barW * hp;
    const barColor = hp > 0.5 ? C.hud : hp > 0.25 ? '#ffcc00' : C.red;
    const grd = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grd.addColorStop(0, barColor);
    grd.addColorStop(1, barColor + 'aa');
    ctx.fillStyle   = grd;
    ctx.shadowBlur  = 12;
    ctx.shadowColor = barColor;
    ctx.fillRect(barX, barY, barFill, barH);

    ctx.strokeStyle = '#333';
    ctx.shadowBlur  = 0;
    ctx.lineWidth   = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    ctx.fillStyle = '#666';
    ctx.font      = '11px JetBrains Mono';
    ctx.fillText('BUFFER_CAPACITY', barX, barY - 5);

    ctx.shadowBlur = 0;
}

// ── Game Loop ────────────────────────────────────────────────
let lastTime = 0;
let animFrameId = null;

function loop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1); // seconds, capped at 100ms
    lastTime  = timestamp;

    if (!gs.running) return;

    // ── Update wave timer  ────────────────────
    gs.waveTimer += dt;
    if (gs.waveTimer > 30) { gs.wave++; gs.waveTimer = 0; }

    // ── Spawn words ───────────────────────────
    gs.spawnTimer += dt;
    const spawnSec = (gs.spawnRate - gs.wave * 60) / 1000;
    if (gs.spawnTimer >= spawnSec) {
        spawnWord();
        gs.spawnTimer = 0;
    }

    // ── Update laser flash decay ──────────────
    gs.laserFlash = Math.max(0, gs.laserFlash - dt * 4);

    // ── Draw background ───────────────────────
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(dt);

    // ── Update / Draw words ───────────────────
    for (let i = gs.words.length - 1; i >= 0; i--) {
        const w = gs.words[i];
        w.y += w.speed * (dt * 60);

        if (w.y > canvas.height - 55) {
            // Reached bottom → damage
            spawnParticles(w.x, canvas.height - 55, C.red, 12);
            playSound('damage');
            takeDamage(20);
            gs.combo = 0;
            if (gs.activeWord === w) gs.activeWord = null;
            gs.words.splice(i, 1);
            continue;
        }

        drawWord(w);
    }

    // ── Bullets ───────────────────────────────
    drawBullets(dt);

    // ── Particles ─────────────────────────────
    updateDrawParticles(dt);

    // ── Ship ──────────────────────────────────
    gs.ship.x = canvas.width / 2;  // always centred
    drawShip(gs.ship, gs.laserFlash);

    // ── HUD ───────────────────────────────────
    drawHUD();

    animFrameId = requestAnimationFrame(loop);
}

// ── Input ────────────────────────────────────────────────────
window.addEventListener('keydown', (e) => {
    if (!gs.running) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length !== 1) return;

    ensureAudio(); // Must be in user gesture handler

    const key = e.key.toUpperCase();

    if (gs.activeWord) {
        const w = gs.activeWord;
        const expected = w.text[w.typedIdx];

        if (expected === key) {
            // Hit ✓
            w.typedIdx++;
            gs.score += 10 + gs.combo;
            playSound('type');
            fireBullet(w);           // fire a bullet toward word
            gs.laserFlash = 1;

            if (w.typedIdx >= w.text.length) {
                // Destroyed!
                gs.combo++;
                gs.killed++;
                if (gs.combo > gs.maxCombo) gs.maxCombo = gs.combo;
                spawnParticles(w.x, w.y, C.cyan, 24);
                playSound('destroy');
                gs.words.splice(gs.words.indexOf(w), 1);
                gs.activeWord = null;
                gs.laserFlash = 0;
            }
        } else {
            // Miss ✗
            w.hitFlash = 1;
            gs.combo   = 0;
            playSound('miss');
        }

    } else {
        // Find new target: lowest word starting with key
        let best  = null;
        let bestY = -1;
        for (const w of gs.words) {
            if (w.text[0] === key && w.y > bestY) {
                bestY = w.y;
                best  = w;
            }
        }

        if (best) {
            gs.activeWord = best;
            best.active   = true;
            best.typedIdx = 1;
            gs.score     += 10;
            if (gs.combo > gs.maxCombo) gs.maxCombo = gs.combo;
            playSound('lock');
            fireBullet(best);
            gs.laserFlash = 1;

            if (best.text.length === 1) {
                gs.combo++;
                gs.killed++;
                spawnParticles(best.x, best.y, C.cyan, 24);
                playSound('destroy');
                gs.words.splice(gs.words.indexOf(best), 1);
                gs.activeWord = null;
                gs.laserFlash = 0;
            }
        } else {
            // No match
            gs.combo = 0;
            playSound('miss');
        }
    }
});

// ── Damage & Game Over ───────────────────────────────────────
function takeDamage(amount) {
    gs.buffer = Math.max(0, gs.buffer - amount);
    if (gs.buffer <= 0) gameOver();
}

function gameOver() {
    gs.running = false;
    playSound('gameover');

    document.getElementById('go-score').textContent = String(gs.score).padStart(6, '0');
    document.getElementById('go-combo').textContent = gs.maxCombo;
    document.getElementById('go-killed').textContent = gs.killed;
    overlay.classList.add('visible');
}

// ── Init / Restart ───────────────────────────────────────────
function initGame() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    overlay.classList.remove('visible');
    initMatrix();
    gs       = makeState();
    lastTime = performance.now();
    animFrameId = requestAnimationFrame(loop);
}

document.getElementById('btn-restart').addEventListener('click', initGame);
document.getElementById('btn-exit').addEventListener('click', () => {
    overlay.innerHTML = `<p style="color:#00ffff;font-size:24px;font-family:'JetBrains Mono',monospace">SESSION_TERMINATED</p>`;
});

// ── Kick‑off ─────────────────────────────────────────────────
initGame();
