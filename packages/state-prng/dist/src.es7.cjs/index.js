"use strict";
/////////////////////
Object.defineProperty(exports, "__esModule", { value: true });
const random_1 = require("@offirmo/random");
/////////////////////
const DEFAULT_SEED = 987;
exports.DEFAULT_SEED = DEFAULT_SEED;
function factory() {
    return {
        seed: DEFAULT_SEED,
        use_count: 0,
    };
}
exports.factory = factory;
/////////////////////
function set_seed(state, seed) {
    state.seed = seed;
    state.use_count = 0;
    return state;
}
exports.set_seed = set_seed;
function update_use_count(state, prng) {
    const new_use_count = prng.getUseCount();
    if (new_use_count < state.use_count)
        throw new Error(`update PRNG state: count is lower than previous count, this is unexpected! Check your code!`);
    if (new_use_count === state.use_count)
        throw new Error(`update PRNG state: count hasn't changed! Check your code!`);
    if (prng !== cached_prng)
        throw new Error(`update PRNG state: passed prng is not the cached one, this is unexpected!`);
    state.use_count = new_use_count;
    return state;
}
exports.update_use_count = update_use_count;
// since
// - we MUST use only one, repeatable PRNG
// - we can't store the prng in the state
// - we must configure it once at start
// we use a global cache to not recreate the prng each time.
// Still, we control that the usage conforms to those expectations.
let cached_prng = 'foo';
let updated = false;
xxx_internal_reset_prng_cache();
// XXX this method has expectations ! (see above)
function get_prng(state) {
    let update_made = false;
    if (cached_prng._seed !== state.seed) {
        cached_prng.seed(state.seed);
        update_made = true;
    }
    if (cached_prng.getUseCount() !== state.use_count) {
        // should never happen
        if (cached_prng.getUseCount() !== 0)
            throw new Error(`state-prng get_prng() unexpected case with current cached implementation: need to update a partially used prng!`);
        cached_prng.discard(state.use_count);
        update_made = true;
    }
    if (update_made) {
        // should never happen if we correctly update the prng state after each use
        if (updated)
            throw new Error(`state-prng unexpected case: need to update again the prng!`);
        updated = true;
    }
    return cached_prng;
}
exports.get_prng = get_prng;
function xxx_internal_reset_prng_cache() {
    cached_prng = random_1.Random.engines.mt19937().seed(DEFAULT_SEED);
    cached_prng._seed = DEFAULT_SEED;
    updated = false;
}
exports.xxx_internal_reset_prng_cache = xxx_internal_reset_prng_cache;
/////////////////////
//# sourceMappingURL=index.js.map