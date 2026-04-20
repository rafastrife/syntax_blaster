/** @fileoverview Player ship rendering. */

import { C } from './constants.js';

/**
 * Draw the player ship centred at (x, y).
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number }} ship
 * @param {number} laserFlash  0–1 glow intensity.
 */
export function drawShip(ctx, ship, laserFlash) {
    const { x, y } = ship;
    ctx.save();
    ctx.translate(x, y);

    const glow = 0.6 + laserFlash * 0.4;

    // Engine glow halo
    const eng = ctx.createRadialGradient(0, 18, 2, 0, 20, 32);
    eng.addColorStop(0, `rgba(0,255,255,${0.55 * glow})`);
    eng.addColorStop(1, 'rgba(0,255,255,0)');
    ctx.fillStyle = eng;
    ctx.beginPath();
    ctx.ellipse(0, 22, 10, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    // Thruster exhaust (randomised flicker)
    const ex = 12 + Math.random() * 12;
    ctx.strokeStyle = `rgba(0,255,255,${0.45 + Math.random() * 0.4})`;
    ctx.lineWidth   = 2;
    ctx.shadowBlur  = 8;
    ctx.shadowColor = C.cyan;
    ctx.beginPath(); ctx.moveTo(-5, 14); ctx.lineTo(0, 14 + ex); ctx.stroke();
    ctx.beginPath(); ctx.moveTo( 5, 14); ctx.lineTo(0, 14 + ex); ctx.stroke();

    // Hull
    ctx.shadowBlur  = 20 * glow;
    ctx.shadowColor = C.cyan;
    ctx.strokeStyle = C.cyan;
    ctx.lineWidth   = 2;
    ctx.fillStyle   = 'rgba(0,24,32,0.88)';
    ctx.beginPath();
    ctx.moveTo(0, -24);   // nose
    ctx.lineTo(18, 14);   // right wing tip
    ctx.lineTo(10,  8);   // right inner notch
    ctx.lineTo( 0, 12);   // bottom centre
    ctx.lineTo(-10,  8);  // left inner notch
    ctx.lineTo(-18, 14);  // left wing tip
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit
    ctx.fillStyle   = `rgba(0,255,255,${0.38 * glow})`;
    ctx.shadowBlur  = 10;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(7,  4);
    ctx.lineTo(-7,  4);
    ctx.closePath();
    ctx.fill();

    // Wing accent stripes
    ctx.strokeStyle = `rgba(174,129,255,${0.7 * glow})`;
    ctx.lineWidth   = 1.2;
    ctx.beginPath(); ctx.moveTo(-18, 14); ctx.lineTo(-10, 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo( 18, 14); ctx.lineTo( 10, 8); ctx.stroke();

    ctx.restore();
}
