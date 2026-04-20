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

        this._mobileInput  = document.getElementById('mobile-input');
        this._inputHandler = this._onMobile.bind(this);
        this._focusHandler = () => this._mobileInput.focus();

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

        // Map mobile software keyboard
        this._mobileInput.addEventListener('input', this._inputHandler);
        this._el.addEventListener('touchstart', this._focusHandler, { passive: true });
        this._el.addEventListener('click', this._focusHandler);

        // Dummy space trick to detect mobile backspaces reliably
        this._mobileInput.value = ' ';
        setTimeout(() => this._mobileInput.focus(), 50);

        return new Promise(resolve => { this._resolve = resolve; });
    }

    // ── Private ───────────────────────────────────────────────

    _onMobile() {
        const val = this._mobileInput.value;
        
        if (val.length === 0) {
            // Delete deleted the dummy space
            if (this._cursor > 0) {
                this._cursor--;
                this._chars[this._cursor] = '_';
            }
        } else if (val.length > 1) {
            // User typed something
            const char = val.slice(-1);
            if (/[A-Za-z0-9]/.test(char) && this._cursor < 3) {
                this._chars[this._cursor] = char.toUpperCase();
                this._cursor++;
                if (this._cursor === 3) {
                    this._render();
                    setTimeout(() => this._trySubmit(), 350);
                }
            }
        }
        
        // Always reset to a single space so we can catch next deletion or char
        this._mobileInput.value = ' ';
        this._render();
    }

    _onKey(e) {
        // Don't let keystrokes bubble back to the game
        e.stopImmediatePropagation();

        // Software keyboards often swallow native keydown, but hard keyboards send them
        if (e.key === 'Backspace') {
            e.preventDefault();
            if (this._cursor > 0) {
                this._cursor--;
                this._chars[this._cursor] = '_';
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            this._trySubmit();
        } else if (e.key.length === 1 && /[A-Za-z0-9]/.test(e.key) && this._cursor < 3) {
            e.preventDefault();
            this._chars[this._cursor] = e.key.toUpperCase();
            this._cursor++;

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
        this._mobileInput.removeEventListener('input', this._inputHandler);
        this._el.removeEventListener('touchstart', this._focusHandler);
        this._el.removeEventListener('click', this._focusHandler);
        this._el.classList.remove('visible');
        this._mobileInput.blur();

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
