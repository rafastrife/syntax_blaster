/** @fileoverview Scrolling matrix-rain background effect. */

const CHARS = 'アイウエオカキクケコサシスセソタチツテトABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
const COL_W = 18;

export class MatrixRain {
    /** @param {HTMLCanvasElement} canvas */
    constructor(canvas) {
        this._cols = [];
        this.init(canvas);
    }

    /** (Re-)initialise columns for the current canvas size. */
    init(canvas) {
        this._cols = [];
        const count = Math.ceil(canvas.width / COL_W);
        for (let i = 0; i < count; i++) {
            this._cols.push({
                x:     i * COL_W,
                y:     Math.random() * -canvas.height,
                speed: 40 + Math.random() * 80,
                len:   8  + Math.floor(Math.random() * 20),
            });
        }
    }

    /**
     * Draw one frame of matrix rain.
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} dt  Delta time in seconds.
     */
    draw(ctx, dt) {
        const h = ctx.canvas.height;
        ctx.font = `${COL_W - 2}px 'JetBrains Mono'`;

        for (const col of this._cols) {
            col.y += col.speed * dt;
            if (col.y - col.len * COL_W > h) {
                col.y     = -COL_W * col.len;
                col.speed = 40 + Math.random() * 80;
            }
            for (let i = 0; i < col.len; i++) {
                const gy = col.y - i * COL_W;
                if (gy < 0 || gy > h) continue;
                const alpha = i === 0 ? 0.85 : Math.max(0, 0.22 - i * 0.012);
                const ch    = CHARS[Math.floor(Math.random() * CHARS.length)];
                ctx.fillStyle = i === 0
                    ? `rgba(210,255,210,${alpha})`
                    : `rgba(0,255,65,${alpha})`;
                ctx.fillText(ch, col.x, gy);
            }
        }
    }
}
