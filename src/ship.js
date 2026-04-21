/** @fileoverview Player character rendering. */

import { C } from './constants.js';

/**
 * Draw the player character (alien robot) centred at (x, y).
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number }} ship
 * @param {number} laserFlash  0–1 glow intensity.
 */
export function drawShip(ctx, ship, laserFlash) {
    const { x, y } = ship;
    const time = performance.now() / 1000;
    
    // Idle animation: hovering up and down naturally
    const hover = Math.sin(time * 4) * 4; 
    
    ctx.save();
    ctx.translate(x, y - 10 + hover); 

    const glow = 0.5 + laserFlash * 0.8;
    const s = 4.5; // Pixel scale/multiplier to fit screen proportions

    // Base color matches the green pixel art reference
    let mainColor = '#39FF14'; // vibrant lime/neon green
    
    // When shooting, flash a white/cyan tint
    if (laserFlash > 0.1) {
        mainColor = '#a8ffb2';
    }

    ctx.fillStyle = mainColor;
    ctx.shadowBlur = 12 * glow;
    ctx.shadowColor = mainColor;

    // --- MAIN BODY ---
    // The reference has a chunky rectangular main body
    ctx.fillRect(-5 * s, -5 * s, 10 * s, 11 * s);

    // --- LEGS ---
    // Reference has two blocky legs at the bottom
    ctx.fillRect(-5 * s, 6 * s, 3 * s, 3 * s); // left leg 
    ctx.fillRect(2 * s,  6 * s, 3 * s, 3 * s); // right leg

    // --- HANDS (ARMS) ---
    // When shooting, the hands recoil backwards (downwards in Y axis)
    const handRecoil = laserFlash * 2 * s;
    
    // Left hand (floating pixel block)
    ctx.fillRect(-8.5 * s, (2 * s) + handRecoil, 2.5 * s, 2.5 * s);
    // Right hand (attached/protruding block)
    ctx.fillRect(5 * s, (2 * s) + handRecoil, 2.5 * s, 2 * s);

    // --- ANTENNA ---
    // Antenna has two segments, and the tip bobs side-to-side
    const antWave = Math.sin(time * 8) * s * 0.4;
    
    // Antenna Base
    ctx.fillRect(-5 * s, -8 * s, 2 * s, 3 * s);
    // Antenna Tip (Floating slightly)
    ctx.fillRect(-7 * s + antWave, -10 * s, 1.5 * s, 1.5 * s);

    // --- EYES ---
    // The reference has two pill-like hollow eyes
    // When laserFlash > 0.2, the eyes light up and squint
    if (laserFlash > 0.2) {
        ctx.fillStyle = C.cyan;
        ctx.shadowBlur = 25;
        ctx.shadowColor = C.cyan;
    } else {
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#ffffff';
    }
    
    // Blink animation (closes occasionally)
    const isBlinking = (time % 4) < 0.15; 
    const squint = laserFlash > 0.1 ? 1.5 : (isBlinking ? 3 : 0);
    const eyeHeight = Math.max(0.5 * s, (3.5 - squint) * s);
    const eyeY = (-1 + squint * 0.5) * s;

    // Left eye
    ctx.fillRect(0.5 * s, eyeY, 1.5 * s, eyeHeight);
    // Right eye
    ctx.fillRect(3 * s, eyeY, 1.5 * s, eyeHeight);

    // --- HOVER SHADOW / ENGINE DUST ---
    // Small particles/thruster pulse beneath the feet
    if (laserFlash <= 0.1) {
        ctx.fillStyle = `rgba(57, 255, 20, 0.2)`;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        const pulse = Math.abs(Math.sin(time * 10));
        ctx.ellipse(0, 10 * s + pulse, 6 * s + pulse * 2, 1.5 * s, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();

    // --- DUAL LASER BEAMS ---
    // Character shoots from its hands!
    if (laserFlash > 0) {
        ctx.save();
        ctx.lineWidth = 3 + laserFlash * 2;
        ctx.strokeStyle = `rgba(0, 255, 255, ${laserFlash})`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = C.cyan;
        
        // Left hand laser
        ctx.beginPath();
        ctx.moveTo(x - 7 * s, y - 10 + hover + (2 * s) + handRecoil);
        ctx.lineTo(x - 7 * s, y - 80 - laserFlash * 100);
        ctx.stroke();

        // Right hand laser
        ctx.beginPath();
        ctx.moveTo(x + 6 * s, y - 10 + hover + (2 * s) + handRecoil);
        ctx.lineTo(x + 6 * s, y - 80 - laserFlash * 100);
        ctx.stroke();
        ctx.restore();
    }
}
