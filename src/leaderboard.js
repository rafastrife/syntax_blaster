/**
 * @fileoverview Global leaderboard — Supabase data layer.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  Fill in SUPABASE_URL and SUPABASE_ANON_KEY after creating your │
 * │  Supabase project. See docs/supabase_setup.md for instructions. │
 * └─────────────────────────────────────────────────────────────────┘
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const TABLE = 'scores';

// ── Client singleton ─────────────────────────────────────────
let _client = null;

function getClient() {
    if (!_client && SUPABASE_URL && SUPABASE_ANON_KEY) {
        _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return _client;
}

/** @returns {boolean} True if the Supabase credentials are configured. */
export const isConfigured = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// ── Read ─────────────────────────────────────────────────────

/**
 * Fetch the top 10 scores ordered by score descending.
 * @returns {Promise<Array<{id:number, name:string, score:number, wave:number}>>}
 */
export async function getTopScores() {
    const db = getClient();
    if (!db) return [];

    const { data, error } = await db
        .from(TABLE)
        .select('id, name, score, wave')
        .order('score', { ascending: false })
        .limit(10);

    if (error) {
        console.error('[Leaderboard] getTopScores error:', error.message);
        return [];
    }
    return data ?? [];
}

// ── Write ─────────────────────────────────────────────────────

/**
 * Submit a new score entry.
 * @param {{ name: string, score: number, wave: number }} entry
 * @returns {Promise<void>}
 */
export async function submitScore({ name, score, wave }) {
    const db = getClient();
    if (!db) {
        console.warn('[Leaderboard] Supabase not configured — score not saved.');
        return;
    }

    const { error } = await db
        .from(TABLE)
        .insert([{ name: name.trim().toUpperCase().substring(0, 3), score, wave }]);

    if (error) console.error('[Leaderboard] submitScore error:', error.message);
}

// ── Realtime ─────────────────────────────────────────────────

/**
 * Subscribe to INSERT/UPDATE/DELETE changes on the scores table.
 * Calls `onUpdate` with a fresh top-10 list whenever the table changes.
 *
 * @param {(scores: Array) => void} onUpdate
 * @returns {() => void}  Call to unsubscribe.
 */
export function subscribeRealtime(onUpdate) {
    const db = getClient();
    if (!db) return () => { };

    const channel = db
        .channel('realtime:scores')
        .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, async () => {
            const scores = await getTopScores();
            onUpdate(scores);
        })
        .subscribe();

    return () => db.removeChannel(channel);
}
