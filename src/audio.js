/** @fileoverview Synthesised sound engine — zero external audio files. */

export class AudioEngine {
    constructor() {
        /** @type {AudioContext|null} */
        this._ctx = null;
    }

    /** Must be called inside a user-gesture handler to comply with browser policy. */
    ensureRunning() {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!this._ctx) this._ctx = new Ctx();
        if (this._ctx.state === 'suspended') this._ctx.resume();
    }

    /** @param {'type'|'destroy'|'miss'|'damage'|'lock'|'gameover'|'emp'} type */
    play(type) {
        this.ensureRunning();
        const ctx = this._ctx;
        const t   = ctx.currentTime;

        switch (type) {
            case 'type': {
                const osc = ctx.createOscillator(); const g = ctx.createGain();
                osc.connect(g); g.connect(ctx.destination);
                osc.type = 'square';
                osc.frequency.setValueAtTime(800 + Math.random() * 400, t);
                g.gain.setValueAtTime(0.07, t);
                g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
                osc.start(t); osc.stop(t + 0.07);
                break;
            }
            case 'destroy': {
                const osc = ctx.createOscillator(); const g = ctx.createGain();
                osc.connect(g); g.connect(ctx.destination);
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(1400, t);
                osc.frequency.exponentialRampToValueAtTime(200, t + 0.18);
                g.gain.setValueAtTime(0.18, t);
                g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
                osc.start(t); osc.stop(t + 0.19);
                break;
            }
            case 'miss': {
                const osc = ctx.createOscillator(); const g = ctx.createGain();
                osc.connect(g); g.connect(ctx.destination);
                osc.type = 'square';
                osc.frequency.setValueAtTime(120, t);
                g.gain.setValueAtTime(0.12, t);
                g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
                osc.start(t); osc.stop(t + 0.13);
                break;
            }
            case 'damage': {
                const buf  = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
                const data = buf.getChannelData(0);
                for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
                const src = ctx.createBufferSource(); const g = ctx.createGain();
                src.buffer = buf; src.connect(g); g.connect(ctx.destination);
                g.gain.setValueAtTime(0.3, t);
                g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
                src.start(t);
                break;
            }
            case 'lock': {
                const osc = ctx.createOscillator(); const g = ctx.createGain();
                osc.connect(g); g.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200, t);
                osc.frequency.setValueAtTime(1600, t + 0.06);
                g.gain.setValueAtTime(0.1, t);
                g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
                osc.start(t); osc.stop(t + 0.13);
                break;
            }
            case 'gameover': {
                [440, 330, 220, 110].forEach((freq, i) => {
                    const osc = ctx.createOscillator(); const g = ctx.createGain();
                    osc.connect(g); g.connect(ctx.destination);
                    osc.type = 'sawtooth';
                    const s = t + i * 0.18;
                    osc.frequency.setValueAtTime(freq, s);
                    g.gain.setValueAtTime(0.15, s);
                    g.gain.exponentialRampToValueAtTime(0.0001, s + 0.3);
                    osc.start(s); osc.stop(s + 0.31);
                });
                break;
            }
            case 'emp': {
                // Deep bass thud
                const bass = ctx.createOscillator(); const bg = ctx.createGain();
                bass.connect(bg); bg.connect(ctx.destination);
                bass.type = 'sawtooth';
                bass.frequency.setValueAtTime(80, t);
                bass.frequency.exponentialRampToValueAtTime(20, t + 0.5);
                bg.gain.setValueAtTime(0.45, t);
                bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
                bass.start(t); bass.stop(t + 0.51);
                // High frequency sweep
                const high = ctx.createOscillator(); const hg = ctx.createGain();
                high.connect(hg); hg.connect(ctx.destination);
                high.type = 'sine';
                high.frequency.setValueAtTime(2200, t);
                high.frequency.exponentialRampToValueAtTime(80, t + 0.45);
                hg.gain.setValueAtTime(0.22, t);
                hg.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
                high.start(t); high.stop(t + 0.46);
                // Noise burst
                const nbuf  = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
                const ndata = nbuf.getChannelData(0);
                for (let i = 0; i < ndata.length; i++) ndata[i] = (Math.random() * 2 - 1);
                const nsrc = ctx.createBufferSource(); const ng = ctx.createGain();
                nsrc.buffer = nbuf; nsrc.connect(ng); ng.connect(ctx.destination);
                ng.gain.setValueAtTime(0.35, t);
                ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
                nsrc.start(t);
                break;
            }
        }
    }
}
