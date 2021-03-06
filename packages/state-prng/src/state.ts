/////////////////////

import { Random, MT19937 } from '@offirmo/random'
import * as deepFreeze from 'deep-freeze-strict'

import { LIB_ID, SCHEMA_VERSION } from './consts'

import {
	State,
} from './types'

/////////////////////

const DEFAULT_SEED = 987

function create(): State {
	return {
		schema_version: SCHEMA_VERSION,
		revision: 0,

		seed: DEFAULT_SEED,
		use_count: 0,
	}
}

/////////////////////

function set_seed(state: State, seed: number): State {
	state.seed = seed
	state.use_count = 0

	return state
}

function update_use_count(state: State, prng: MT19937, options: any = {}): State {
	const new_use_count = prng.getUseCount()

	if (new_use_count < state.use_count)
		throw new Error(`update PRNG state: count is lower than previous count, this is unexpected! Check your code!`)

	if (!options.I_swear_I_really_cant_know_whether_the_rng_was_used && new_use_count === state.use_count)
		console.warn(`update PRNG state: count hasn't changed = no random was generated! This is most likely a bug, check your code!`)

	if (prng !== cached_prng)
		throw new Error(`update PRNG state: passed prng is not the cached one, this is unexpected!`)

	state.use_count = new_use_count

	return state
}


/////////////////////

// TODO improve offirmo/random
interface MTEngineWithSeed extends MT19937 {
	_seed?: number
}

// since
// - we MUST use only one, repeatable PRNG
// - we can't store the prng in the state
// - we must configure it once at start
// we use a global cache to not recreate the prng each time.
// Still, we control that the usage conforms to those expectations.

let cached_prng: MTEngineWithSeed = ('foo' as any as MTEngineWithSeed)
let updated = false
xxx_internal_reset_prng_cache()

// XXX this method has expectations ! (see above)
function get_prng(state: Readonly<State>): MT19937 {
	let update_made = false

	if (cached_prng._seed !== state.seed) {
		cached_prng.seed(state.seed)
		update_made = true
	}

	if (cached_prng.getUseCount() !== state.use_count) {

		// should never happen
		if (cached_prng.getUseCount() !== 0)
			throw new Error(`state-prng get_prng() unexpected case with current cached implementation: need to update a partially used prng!`)

		cached_prng.discard(state.use_count)
		update_made = true
	}

	if (update_made) {
		// should never happen if we correctly update the prng state after each use
		if (updated)
			throw new Error(`state-prng unexpected case: need to update again the prng!`)
		updated = true
	}

	return cached_prng
}

function xxx_internal_reset_prng_cache() {
	cached_prng = Random.engines.mt19937().seed(DEFAULT_SEED)
	cached_prng._seed = DEFAULT_SEED
	updated = false
}

/////////////////////

// needed to test migrations, both here and in composing parents

// a full featured, non-trivial demo state
// needed for demos
const DEMO_STATE: State = deepFreeze({
	schema_version: 1,
	revision: 108,

	seed: 1234,
	use_count: 107,
})

// the oldest format we can migrate from
// must correspond to state above
const OLDEST_LEGACY_STATE_FOR_TESTS: any = deepFreeze({
	// no schema_version = 0

	seed: 1234,
	use_count: 107,
})

// some hints may be needed to migrate to demo state
const MIGRATION_HINTS_FOR_TESTS: any = deepFreeze({
	to_v1: {
		revision: 108,
	},
})

/////////////////////

// TODO serialize?

/////////////////////

export {
	State,
	DEFAULT_SEED,
	create,

	set_seed,
	update_use_count,

	get_prng,

	// exposed for testability, do not use !
	xxx_internal_reset_prng_cache,

	DEMO_STATE,
	OLDEST_LEGACY_STATE_FOR_TESTS,
	MIGRATION_HINTS_FOR_TESTS,
}

/////////////////////
