//! Leaderboard tracking for the Tipz contract.
//!
//! Maintains a sorted list (descending by `total_tips_received`) of up to
//! [`MAX_LEADERBOARD_SIZE`] creators.  The list is refreshed after every tip
//! via [`update_leaderboard`].
//!
//! ## Storage
//! The board is persisted as a single `Vec<LeaderboardEntry>` under
//! `DataKey::Leaderboard` in instance storage.
//!
//! ## Complexity
//! Sorting uses selection sort — O(n²) — which is acceptable for n ≤ 50.

use soroban_sdk::{Address, Env, Vec};

use crate::storage::DataKey;
use crate::types::{LeaderboardEntry, Profile};

/// Maximum number of entries retained on the leaderboard.
pub const MAX_LEADERBOARD_SIZE: u32 = 50;

// ── internal helpers ──────────────────────────────────────────────────────────

fn load(env: &Env) -> Vec<LeaderboardEntry> {
    env.storage()
        .instance()
        .get(&DataKey::Leaderboard)
        .unwrap_or_else(|| Vec::new(env))
}

fn save(env: &Env, board: &Vec<LeaderboardEntry>) {
    env.storage().instance().set(&DataKey::Leaderboard, board);
}

/// Sort `board` in-place, descending by `total_tips_received`.
///
/// Uses selection sort — O(n²) — which is fine for n ≤ [`MAX_LEADERBOARD_SIZE`].
fn sort_descending(board: &mut Vec<LeaderboardEntry>) {
    let len = board.len();
    let mut i: u32 = 0;
    while i < len {
        let mut max_idx = i;
        let mut j = i + 1;
        while j < len {
            if board.get(j).unwrap().total_tips_received
                > board.get(max_idx).unwrap().total_tips_received
            {
                max_idx = j;
            }
            j += 1;
        }
        if max_idx != i {
            let a = board.get(i).unwrap();
            let b = board.get(max_idx).unwrap();
            board.set(i, b);
            board.set(max_idx, a);
        }
        i += 1;
    }
}

// ── public API ────────────────────────────────────────────────────────────────

/// Refresh the leaderboard after `profile` has received a tip.
///
/// If the creator already has an entry it is updated in-place; otherwise a new
/// entry is appended.  The list is then sorted descending by
/// `total_tips_received` and trimmed to [`MAX_LEADERBOARD_SIZE`].
pub fn update_leaderboard(env: &Env, profile: &Profile) {
    let mut board = load(env);
    let len = board.len();

    // Locate an existing entry for this creator.
    let mut existing_idx: Option<u32> = None;
    let mut i: u32 = 0;
    while i < len {
        if board.get(i).unwrap().address == profile.owner {
            existing_idx = Some(i);
            break;
        }
        i += 1;
    }

    let entry = LeaderboardEntry {
        address: profile.owner.clone(),
        username: profile.username.clone(),
        total_tips_received: profile.total_tips_received,
        credit_score: profile.credit_score,
    };

    match existing_idx {
        Some(idx) => board.set(idx, entry),
        None => board.push_back(entry),
    }

    sort_descending(&mut board);

    // Trim to the maximum allowed size (drop the tail — lowest earners).
    while board.len() > MAX_LEADERBOARD_SIZE {
        board.pop_back();
    }

    save(env, &board);
}

/// Return up to `limit` leaderboard entries sorted descending by total tips.
///
/// Passing `limit = 0` returns the full list.
pub fn get_leaderboard(env: &Env, limit: u32) -> Vec<LeaderboardEntry> {
    let board = load(env);
    if limit == 0 || limit >= board.len() {
        return board;
    }
    let mut result = Vec::new(env);
    let mut i: u32 = 0;
    while i < limit {
        result.push_back(board.get(i).unwrap());
        i += 1;
    }
    result
}

/// Return the 1-based rank of `address` on the leaderboard, or `None` when
/// the address is not present.
pub fn get_leaderboard_rank(env: &Env, address: &Address) -> Option<u32> {
    let board = load(env);
    let len = board.len();
    let mut i: u32 = 0;
    while i < len {
        if board.get(i).unwrap().address == *address {
            return Some(i + 1);
        }
        i += 1;
    }
    None
}
