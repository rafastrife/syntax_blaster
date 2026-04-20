/** @fileoverview Words, bullets, particles and EMP shockwave. */

import { C } from './constants.js';

// ── Word entity ──────────────────────────────────────────────

/**
 * Draw a word entity box with per-character colouring.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ text:string, typedIdx:number, x:number, y:number, active:boolean, hitFlash:number }} w
 */
export function drawWord(ctx, w) {
    const FS      = 15;
    const PAD     = { x: 16, y: 10 };
    ctx.font      = `bold ${FS}px 'JetBrains Mono'`;

    const textW   = ctx.measureText(w.text).width;
    const bw      = textW + PAD.x * 2;
    const bh      = FS + PAD.y * 2;
    const bx      = w.x - bw / 2;
    const by      = w.y - bh / 2;

    const borderC = w.active ? C.cyan    : C.dimWhite;
    const glowC   = w.active ? C.cyan    : 'rgba(200,200,200,0.4)';
    const bgAlpha = w.active ? 0.28      : 0.15;

    // Hit flash
    if (w.hitFlash > 0) {
        ctx.save();
        ctx.globalAlpha = w.hitFlash * 0.6;
        ctx.fillStyle   = C.red;
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

    // Active diamond pip
    if (w.active) {
        const ds = 6;
        ctx.fillStyle   = C.cyan;
        ctx.shadowBlur  = 10;
        ctx.shadowColor = C.cyan;
        ctx.beginPath();
        ctx.moveTo(w.x,      by - 4 - ds);
        ctx.lineTo(w.x + ds, by - 4);
        ctx.lineTo(w.x,      by - 4 + ds);
        ctx.lineTo(w.x - ds, by - 4);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();

    // Characters
    let cx = bx + PAD.x;
    for (let i = 0; i < w.text.length; i++) {
        ctx.font        = `bold ${FS}px 'JetBrains Mono'`;
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur  = 0;
        if (i < w.typedIdx) {
            ctx.fillStyle = 'rgba(255,0,60,0.3)';
        } else if (w.active) {
            ctx.fillStyle   = C.cyan;
            ctx.shadowColor = C.cyan;
            ctx.shadowBlur  = 8;
        } else {
            ctx.fillStyle   = C.white;
            ctx.shadowColor = 'rgba(255,255,255,0.35)';
            ctx.shadowBlur  = 3;
        }
        ctx.fillText(w.text[i], cx, by + PAD.y + FS - 3);
        cx += ctx.measureText(w.text[i]).width;
    }
    ctx.shadowBlur = 0;
}

// ── Bullets ──────────────────────────────────────────────────

/**
 * @param {Array} bullets
 * @param {{ x:number, y:number }} ship
 * @param {object} target  Word reference.
 */
export function fireBullet(bullets, ship, target) {
    bullets.push({
        x:    ship.x,
        y:    ship.y - 24,
        tx:   target.x,
        ty:   target.y,
        life: 1,
        target,
    });
}

/**
 * Advance and draw all bullets.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} bullets
 * @param {{ x:number, y:number }} ship
 * @param {number} dt
 */
export function updateBullets(ctx, bullets, ship, dt) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b  = bullets[i];
        const dx = b.tx - b.x;
        const dy = b.ty - b.y;
        const d  = Math.sqrt(dx * dx + dy * dy);

        if (d < 6) { bullets.splice(i, 1); continue; }

        const spd = Math.min(d, 900 * dt);
        b.x += (dx / d) * spd;
        b.y += (dy / d) * spd;
        b.life = Math.max(0, b.life - dt * 2.5);

        // Glow dot
        const grd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 6);
        grd.addColorStop(0,   'rgba(255,255,255,1)');
        grd.addColorStop(0.4, `rgba(0,255,255,${b.life})`);
        grd.addColorStop(1,   'rgba(0,255,255,0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(b.x, b.y, 6, 0, Math.PI * 2); ctx.fill();

        // Trail
        ctx.save();
        ctx.globalAlpha  = b.life * 0.35;
        ctx.strokeStyle  = '#00ffff';
        ctx.lineWidth    = 1.5;
        ctx.shadowBlur   = 10;
        ctx.shadowColor  = '#00ffff';
        ctx.setLineDash([5, 7]);
        ctx.beginPath();
        ctx.moveTo(ship.x, ship.y - 24);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.restore();
    }
}

// ── Particles ────────────────────────────────────────────────

/**
 * @param {Array}  particles
 * @param {number} x
 * @param {number} y
 * @param {string} color
 * @param {number} [count=18]
 */
export function spawnParticles(particles, x, y, color, count = 18) {
    for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 30 + Math.random() * 110;
        particles.push({
            x, y,
            vx:   Math.cos(ang) * spd,
            vy:   Math.sin(ang) * spd,
            life: 1,
            size: 1.5 + Math.random() * 3,
            color,
            glyph: Math.random() > 0.45
                ? String.fromCharCode(65 + Math.floor(Math.random() * 26))
                : String(Math.floor(Math.random() * 10)),
        });
    }
}

/**
 * Update and draw all particles.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} particles
 * @param {number} dt
 */
export function updateParticles(ctx, particles, dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x    += p.vx * dt;
        p.y    += p.vy * dt;
        p.life -= dt * 2;
        if (p.life <= 0) { particles.splice(i, 1); continue; }

        ctx.save();
        ctx.globalAlpha  = p.life;
        ctx.fillStyle    = p.color;
        ctx.shadowBlur   = 8;
        ctx.shadowColor  = p.color;
        if (Math.random() > 0.45) {
            ctx.font = `${p.size + 8}px 'JetBrains Mono'`;
            ctx.fillText(p.glyph, p.x, p.y);
        } else {
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }
}

// ── EMP Shockwave ────────────────────────────────────────────

export class EmpWave {
    /**
     * @param {number} x  Origin X (ship centre).
     * @param {number} y  Origin Y (ship centre).
     */
    constructor(x, y) {
        this.x          = x;
        this.y          = y;
        this.radius     = 0;
        this.maxRadius  = Math.sqrt(x * x + y * y) * 2.5 || 900;
        this.life       = 1;
    }

    /** @param {number} dt */
    update(dt) {
        this.radius += 650 * dt;
        this.life    = Math.max(0, 1 - (this.radius / this.maxRadius));
    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
        if (this.life <= 0) return;

        // Outer ring — bright purple
        ctx.save();
        ctx.shadowBlur   = 30 * this.life;
        ctx.shadowColor  = '#ae81ff';
        ctx.strokeStyle  = `rgba(174,129,255,${this.life})`;
        ctx.lineWidth    = 3 * this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner ring — cyan
        ctx.shadowColor  = '#00ffff';
        ctx.strokeStyle  = `rgba(0,255,255,${this.life * 0.6})`;
        ctx.lineWidth    = 1.5 * this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.65, 0, Math.PI * 2);
        ctx.stroke();

        // Central flash (only during early expansion)
        if (this.life > 0.8) {
            const flashAlpha = (this.life - 0.8) * 5;
            const flash = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 80);
            flash.addColorStop(0, `rgba(174,129,255,${flashAlpha * 0.7})`);
            flash.addColorStop(1, 'rgba(174,129,255,0)');
            ctx.fillStyle = flash;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 80, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    isDead() { return this.life <= 0; }
}
