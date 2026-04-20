/**
 * @fileoverview Arcade-style 3-character name input controller.
 *
 * Usage:
 *   const ni = new NameInputController(document.getElementById('name-overlay'));
 *   const name = await ni.prompt(score);  // resolves with "NEO", "RAF", etc.
 */

export class NameInputController {
    /**
     * @param {HTMLElement} overlayEl  The `#name-overlay` element.
     */
    constructor(overlayEl) {
        this._el      = overlayEl;
        this._chars   = ['_', '_', '_'];
        this._cursor  = 0;
        this._resolve = null;
        this._handler = this._onKey.bind(this);

        this._slots = [
            overlayEl.querySelector('#slot-0'),
            overlayEl.querySelector('#slot-1'),
            overlayEl.querySelector('#slot-2'),
        ];

        // Confirm button (also handles mouse/touch users)
        const btn = overlayEl.querySelector('#btn-confirm-name');
        if (btn) btn.addEventListener('click', () => this._trySubmit());
    }

    /**
     * Show the name input modal and wait for the player to enter 3 characters.
     * @param {number} score  Current score (displayed in the modal).
     * @returns {Promise<string>}  Resolves with a 3-char uppercase string.
     */
    prompt(score) {
        this._chars  = ['_', '_', '_'];
        this._cursor = 0;
        this._render();

        const scoreEl = this._el.querySelector('#name-display-score');
        if (scoreEl) scoreEl.textContent = String(score).padStart(6, '0');

        this._el.classList.add('visible');
        window.addEventListener('keydown', this._handler);

        return new Promise(resolve => { this._resolve = resolve; });
    }

    // ── Private ───────────────────────────────────────────────

    _onKey(e) {
        // Don't let keystrokes bubble back to the game
        e.stopImmediatePropagation();

        if (e.key === 'Backspace') {
            if (this._cursor > 0) {
                this._cursor--;
                this._chars[this._cursor] = '_';
            }
        } else if (e.key === 'Enter') {
            this._trySubmit();
        } else if (e.key.length === 1 && /[A-Za-z0-9]/.test(e.key) && this._cursor < 3) {
            this._chars[this._cursor] = e.key.toUpperCase();
            this._cursor++;

            // Auto-confirm after the 3rd character (short delay for feedback)
            if (this._cursor === 3) {
                this._render();
                setTimeout(() => this._trySubmit(), 350);
                return;
            }
        }
        this._render();
    }

    _trySubmit() {
        // Require at least one non-placeholder character
        const filled = this._chars.filter(c => c !== '_').length;
        if (filled === 0) return;

        window.removeEventListener('keydown', this._handler);
        this._el.classList.remove('visible');

        // Pad missing slots with a space marker
        const name = this._chars.join('').replace(/_/g, ' ').trimEnd().padEnd(3, '_');
        this._resolve(name.substring(0, 3).toUpperCase());
    }

    _render() {
        this._slots.forEach((slot, i) => {
            slot.textContent = this._chars[i];
            slot.classList.toggle('slot-active', i === this._cursor);
            slot.classList.toggle('slot-filled', this._chars[i] !== '_');
        });
    }
}
