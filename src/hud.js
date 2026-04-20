/** @fileoverview Game HUD — score, wave, combo, buffer bar, EMP charges. */

import { C } from './constants.js';

/**
 * Render the complete HUD.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} gs   Current game state.
 * @param {HTMLCanvasElement} canvas
 */
export function drawHUD(ctx, gs, canvas) {
    const W   = canvas.width;
    const H   = canvas.height;
    const PAD = 18;

    ctx.shadowBlur = 0;

    // ── SCORE (top-left) ─────────────────────────────────────
    ctx.font        = `bold 14px 'JetBrains Mono'`;
    ctx.fillStyle   = C.green;
    ctx.shadowColor = C.green;
    ctx.shadowBlur  = 8;
    ctx.fillText(`SCORE: ${String(gs.score).padStart(6, '0')}`, PAD, PAD + 14);

    // ── WAVE (top-right) ─────────────────────────────────────
    const waveStr = `WAVE: ${gs.wave}`;
    ctx.fillStyle   = C.green;
    ctx.shadowColor = C.green;
    ctx.fillText(waveStr, W - ctx.measureText(waveStr).width - PAD, PAD + 14);

    // ── COMBO (top-centre) ───────────────────────────────────
    if (gs.combo > 1) {
        const comboStr = `COMBO ×${gs.combo}`;
        ctx.font        = `bold 16px 'JetBrains Mono'`;
        ctx.fillStyle   = C.purple;
        ctx.shadowColor = C.purple;
        ctx.shadowBlur  = 12;
        ctx.fillText(comboStr, (W - ctx.measureText(comboStr).width) / 2, PAD + 16);
    }

    ctx.shadowBlur = 0;

    // ── BUFFER BAR (bottom-centre) ───────────────────────────
    const barW = 260;
    const barH = 8;
    const barX = (W - barW) / 2;
    const barY = H - 30;

    ctx.fillStyle = '#111';
    ctx.fillRect(barX, barY, barW, barH);

    const hp       = gs.buffer / 100;
    const barColor = hp > 0.5 ? C.green : hp > 0.25 ? '#ffcc00' : C.red;
    const grd      = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grd.addColorStop(0, barColor);
    grd.addColorStop(1, barColor + 'aa');
    ctx.fillStyle   = grd;
    ctx.shadowBlur  = 12;
    ctx.shadowColor = barColor;
    ctx.fillRect(barX, barY, barW * hp, barH);

    ctx.shadowBlur  = 0;
    ctx.strokeStyle = '#333';
    ctx.lineWidth   = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    ctx.font      = '11px JetBrains Mono';
    ctx.fillStyle = '#666';
    ctx.fillText('BUFFER_CAPACITY', barX, barY - 6);

    // ── EMP CHARGES (bottom-left) ────────────────────────────
    ctx.font = `bold 12px 'JetBrains Mono'`;

    const empLabelStr = 'EMP [SPACE]:';
    ctx.fillStyle   = '#555';
    ctx.shadowBlur  = 0;
    ctx.fillText(empLabelStr, PAD, H - 34);

    const dotRadius = 7;
    const dotStartX = PAD + ctx.measureText(empLabelStr).width + 10;
    const dotY      = H - 40;

    for (let i = 0; i < 3; i++) {
        const active = i < gs.empCharges;
        const cx     = dotStartX + i * (dotRadius * 2 + 6);
        ctx.beginPath();
        ctx.arc(cx, dotY, dotRadius, 0, Math.PI * 2);
        if (active) {
            ctx.fillStyle   = C.purple;
            ctx.shadowColor = C.purple;
            ctx.shadowBlur  = 12;
        } else {
            ctx.fillStyle   = '#2a2a2a';
            ctx.shadowBlur  = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // ── SPACE hint when no EMP charges ───────────────────────
    if (gs.empCharges === 0) {
        ctx.font      = '10px JetBrains Mono';
        ctx.fillStyle = '#3a1a1a';
        ctx.fillText('NO CHARGES', dotStartX, H - 20);
    }
}
