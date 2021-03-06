/////////////////////

import { Random, Engine } from '@offirmo/random'
import * as deepFreeze from 'deep-freeze-strict'

/////////////////////

import {
	InventorySlot,
	ItemQuality,
	Item,
	generate_uuid,
} from '@oh-my-rpg/definitions'

import * as MetaState from '@oh-my-rpg/state-meta'

import * as CharacterState from '@oh-my-rpg/state-character'
import {
	CharacterAttribute,
	CharacterAttributes,
	CharacterClass,
	increase_stat,
	rename,
	switch_class,
} from '@oh-my-rpg/state-character'

import * as WalletState from '@oh-my-rpg/state-wallet'
import { Currency } from '@oh-my-rpg/state-wallet'

import * as InventoryState from '@oh-my-rpg/state-inventory'
import {
	InventoryCoordinates,
	get_item_in_slot,
	get_item_at_coordinates,
} from '@oh-my-rpg/state-inventory'

import * as PRNGState from '@oh-my-rpg/state-prng'
import {
	get_prng,
} from '@oh-my-rpg/state-prng'

import {
	Weapon,
	create as create_weapon,
	enhance as enhance_weapon,
	MAX_ENHANCEMENT_LEVEL as MAX_WEAPON_ENHANCEMENT_LEVEL,
} from '@oh-my-rpg/logic-weapons'

import {
	Armor,
	create as create_armor,
	enhance as enhance_armor,
	MAX_ENHANCEMENT_LEVEL as MAX_ARMOR_ENHANCEMENT_LEVEL,
} from '@oh-my-rpg/logic-armors'

import {
	create as create_monster,
	DEMO_MONSTER_01,
} from '@oh-my-rpg/logic-monsters'

import {
	appraise,
} from '@oh-my-rpg/logic-shop'

import {
	CoinsGain,
	OutcomeArchetype,
	AdventureType,
	AdventureArchetype,

	get_archetype,
	pick_random_good_archetype,
	pick_random_bad_archetype,
	generate_random_coin_gain,
} from '@oh-my-rpg/logic-adventures'

import { LIB_ID, SCHEMA_VERSION } from './consts'

import {
	State,
	GainType,
	Adventure,
} from './types'


/////////////////////

function create(): State {
	let state: State = {
		schema_version: SCHEMA_VERSION,
		revision: 0,

		meta: MetaState.create(),
		avatar: CharacterState.create(),
		inventory: InventoryState.create(),
		wallet: WalletState.create(),
		prng: PRNGState.create(),

		last_adventure: null,
		click_count: 0,
		good_click_count: 0,
		meaningful_interaction_count: 0,
	}

	let rng = get_prng(state.prng)

	const start_weapon = create_weapon(rng, {
		base_hid: 'spoon',
		qualifier1_hid: 'used',
		qualifier2_hid: 'noob',
		quality: ItemQuality.common,
		base_strength: 1,
	})
	state = receive_item(state, start_weapon)
	state = equip_item(state, 0)

	const start_armor = create_armor(rng, {
		base_hid: 'socks',
		qualifier1_hid: 'used',
		qualifier2_hid: 'noob',
		quality: 'common',
		base_strength: 1,
	})
	state = receive_item(state, start_armor)
	state = equip_item(state, 0)

	//state.prng = PRNGState.update_use_count(state.prng, rng)

	return state
}

/////////////////////

const STATS = [ 'health', 'mana', 'strength', 'agility', 'charisma', 'wisdom', 'luck' ]
function instantiate_adventure_archetype(rng: Engine, aa: AdventureArchetype, character: CharacterAttributes, inventory: InventoryState.State): Adventure {
	let {hid, good, type, outcome : should_gain} = aa

	should_gain = {...should_gain}

	// instantiate the special gains
	if (should_gain.random_charac) {
		const stat: keyof OutcomeArchetype = Random.pick(rng, STATS) as keyof OutcomeArchetype
		should_gain[stat] = true
	}
	if (should_gain.lowest_charac) {
		const lowest_stat: keyof OutcomeArchetype = STATS.reduce((acc, val) => {
			return (character as any)[acc] < (character as any)[val] ? acc : val
		}, 'health') as keyof OutcomeArchetype
		should_gain[lowest_stat] = true
	}

	if (should_gain.armor_or_weapon) {
		// TODO take into account the existing inventory
		if (Random.bool()(rng))
			should_gain.armor = true
		else
			should_gain.weapon = true
	}
	if (should_gain.armor_or_weapon_improvement) {
		if (Random.bool()(rng))
			should_gain.armor_improvement = true
		else
			should_gain.weapon_improvement = true
	}

	// intermediate data
	const new_player_level = character.level + (should_gain.level ? 1 : 0)

	// TODO check multiple charac gain (should not happen)
	return {
		uuid: generate_uuid(),
		hid,
		good,
		encounter: type === AdventureType.fight ? create_monster(rng, {level: character.level}) : undefined,
		gains: {
			level:    should_gain.level    ? 1 : 0,
			health:   should_gain.health   ? 1 : 0,
			mana:     should_gain.mana     ? 1 : 0,
			strength: should_gain.strength ? 1 : 0,
			agility:  should_gain.agility  ? 1 : 0,
			charisma: should_gain.charisma ? 1 : 0,
			wisdom:   should_gain.wisdom   ? 1 : 0,
			luck:     should_gain.luck     ? 1 : 0,
			coin:     generate_random_coin_gain(rng, should_gain.coin, new_player_level),
			token:    should_gain.token    ? 1 : 0,
			armor:    should_gain.armor    ? create_armor(rng) : null,
			weapon:   should_gain.weapon   ? create_weapon(rng) : null,
			armor_improvement:  should_gain.armor_improvement,
			weapon_improvement: should_gain.weapon_improvement,
		}
	}
}

function receive_stat_increase(state: State, stat: CharacterAttribute, amount = 1): State {
	state.avatar = increase_stat(state.avatar, stat, amount)
	return state
}

function receive_item(state: State, item: Item): State {
	// TODO handle inventory full
	state.inventory = InventoryState.add_item(state.inventory, item)
	return state
}

function receive_coins(state: State, amount: number): State {
	state.wallet = WalletState.add_amount(state.wallet, Currency.coin, amount)
	return state
}

function receive_tokens(state: State, amount: number): State {
	state.wallet = WalletState.add_amount(state.wallet, Currency.token, amount)
	return state
}

function play_good(state: State, explicit_adventure_archetype_hid?: string): State {
	state.good_click_count++
	state.meaningful_interaction_count++;

	let rng = get_prng(state.prng)

	const aa: AdventureArchetype = explicit_adventure_archetype_hid
		? get_archetype(explicit_adventure_archetype_hid)
		: pick_random_good_archetype(rng)

	if (!aa)
		throw new Error(`play_good(): hinted adventure archetype "${explicit_adventure_archetype_hid}" could not be found!`)

	const adventure = instantiate_adventure_archetype(
		rng,
		aa,
		state.avatar.attributes,
		state.inventory,
	)
	state.last_adventure = adventure

	const {gains : gained} = adventure

	// TODO store hid for no repetition

	let gain_count = 0
	if (gained.level) {
		gain_count++
		state = receive_stat_increase(state, CharacterAttribute.level)
	}
	if (gained.health) {
		gain_count++
		state = receive_stat_increase(state, CharacterAttribute.health, gained.health)
	}
	if (gained.mana) {
		gain_count++
		state = receive_stat_increase(state, CharacterAttribute.mana, gained.mana)
	}
	if (gained.strength) {
		gain_count++
		state = receive_stat_increase(state, CharacterAttribute.strength, gained.strength)
	}
	if (gained.agility) {
		gain_count++
		state = receive_stat_increase(state, CharacterAttribute.agility, gained.agility)
	}
	if (gained.charisma) {
		gain_count++
		state = receive_stat_increase(state, CharacterAttribute.charisma, gained.charisma)
	}
	if (gained.wisdom) {
		gain_count++
		state = receive_stat_increase(state, CharacterAttribute.wisdom, gained.wisdom)
	}
	if (gained.luck) {
		gain_count++
		state = receive_stat_increase(state, CharacterAttribute.luck, gained.luck)
	}

	if (gained.coin) {
		gain_count++
		state = receive_coins(state, gained.coin)
	}
	if (gained.token) {
		gain_count++
		state = receive_tokens(state, gained.token)
	}

	if (gained.weapon) {
		gain_count++
		state = receive_item(state, gained.weapon)
	}
	if (gained.armor) {
		gain_count++
		state = receive_item(state, gained.armor)
	}

	if (gained.weapon_improvement) {
		gain_count++
		let weapon_to_enhance = get_item_in_slot(state.inventory, InventorySlot.weapon) as Weapon
		if (weapon_to_enhance && weapon_to_enhance.enhancement_level < MAX_WEAPON_ENHANCEMENT_LEVEL)
			enhance_weapon(weapon_to_enhance)
		// TODO enhance another weapon as fallback
	}

	if (gained.armor_improvement) {
		gain_count++
		const armor_to_enhance = get_item_in_slot(state.inventory, InventorySlot.armor) as Armor
		if (armor_to_enhance && armor_to_enhance.enhancement_level < MAX_ARMOR_ENHANCEMENT_LEVEL)
			enhance_armor(armor_to_enhance)
		// TODO enhance another armor as fallback
	}

	if (!gain_count)
		throw new Error(`play_good() for hid "${aa.hid}" unexpectedly resulted in NO gains!`)
	state.prng = PRNGState.update_use_count(state.prng, rng, {
		I_swear_I_really_cant_know_whether_the_rng_was_used: !!explicit_adventure_archetype_hid
	})

	return state
}

function appraise_item_at_coordinates(state: Readonly<State>, coordinates: InventoryCoordinates): number {
	const item_to_sell = get_item_at_coordinates(state.inventory, coordinates)
	if (!item_to_sell)
		throw new Error('Sell: No item!')

	return appraise(item_to_sell)
}

/////////////////////

// allow passing an explicit adventure archetype for testing !
function play(state: State, explicit_adventure_archetype_hid?: string): State {
	state.click_count++

	// TODO good / bad
	return play_good(state, explicit_adventure_archetype_hid)
}

function equip_item(state: State, coordinates: InventoryCoordinates): State {
	// TODO count it as a meaningful interaction if positive (or with a limit)
	state.inventory = InventoryState.equip_item(state.inventory, coordinates)
	return state
}

function sell_item(state: State, coordinates: InventoryCoordinates): State {
	const price = appraise_item_at_coordinates(state, coordinates)

	state.inventory = InventoryState.remove_item(state.inventory, coordinates)
	state.wallet = WalletState.add_amount(state.wallet, Currency.coin, price)

	// TODO count it as a meaningful interaction if positive (or with a limit)
	return state
}

function rename_avatar(state: State, new_name: string): State {
	// TODO count it as a meaningful interaction once
	state.avatar = rename(state.avatar, new_name)
	return state
}

function change_avatar_class(state: State, klass: CharacterClass): State {
	// TODO make this have an effect (in v2 ?)
	state.avatar = switch_class(state.avatar, klass)
	return state
}

/////////////////////

// needed to test migrations, both here and in composing parents

// a full featured, non-trivial demo state
// needed for demos
const DEMO_ADVENTURE_01: Adventure = deepFreeze({
	hid: 'fight_lost_any',
	uuid: 'uu1de1~EVAdXlW5_p23Ro4OH',
	good: true,
	encounter: DEMO_MONSTER_01,
	gains: {
		level: 0,
		health: 0,
		mana: 0,
		strength: 0,
		agility: 0,
		charisma: 0,
		wisdom: 0,
		luck: 1,
		coin: 0,
		token: 0,
		armor: null,
		weapon: null,
		armor_improvement: false,
		weapon_improvement: false,
	},
})
const DEMO_ADVENTURE_02: Adventure = deepFreeze({
	hid: 'dying_man',
	uuid: 'uu1de2~p23Ro4OH_EVAdXlW5',
	good: true,
	gains: {
		level: 0,
		health: 0,
		mana: 0,
		strength: 0,
		agility: 0,
		charisma: 0,
		wisdom: 0,
		luck: 0,
		coin: 1234,
		token: 0,
		weapon: null,
		armor: null,
		weapon_improvement: false,
		armor_improvement: false,
	}
})
const DEMO_STATE: State = deepFreeze({
	schema_version: 3,
	revision: 203,

	meta: MetaState.DEMO_STATE,
	avatar: CharacterState.DEMO_STATE,
	inventory: InventoryState.DEMO_STATE,
	wallet: WalletState.DEMO_STATE,
	prng: PRNGState.DEMO_STATE,

	last_adventure: DEMO_ADVENTURE_01,

	click_count:                  86,
	good_click_count:             86,
	meaningful_interaction_count: 86,
})

// the oldest format we can migrate from
// must correspond to state above
const OLDEST_LEGACY_STATE_FOR_TESTS: any = deepFreeze({
	// no schema_version = 0

	meta: MetaState.OLDEST_LEGACY_STATE_FOR_TESTS,
	avatar: CharacterState.OLDEST_LEGACY_STATE_FOR_TESTS,
	inventory: InventoryState.OLDEST_LEGACY_STATE_FOR_TESTS,
	wallet: WalletState.OLDEST_LEGACY_STATE_FOR_TESTS,
	prng: PRNGState.OLDEST_LEGACY_STATE_FOR_TESTS,

	last_adventure: {
		hid: 'fight_lost_any',
		good: true,
		encounter: {
			name: 'chicken',
			level: 7,
			rank: 'elite',
			possible_emoji: '🐓',
		},
		gains: {
			level: 0,
			health: 0,
			mana: 0,
			strength: 0,
			agility: 0,
			charisma: 0,
			wisdom: 0,
			luck: 1,
			coins: 0,
			tokens: 0,
			armor: null,
			weapon: null,
			armor_improvement: false,
			weapon_improvement: false,
		},
	},
	click_count:                  86,
	good_click_count:             86,
	meaningful_interaction_count: 86,
})

// some hints may be needed to migrate to demo state
const MIGRATION_HINTS_FOR_TESTS: any = deepFreeze({
	to_v3: {
		last_adventure_uuid: 'uu1de1~EVAdXlW5_p23Ro4OH'
	},

	to_v2: {
		revision: 203
	},

	meta: MetaState.MIGRATION_HINTS_FOR_TESTS,
	avatar: CharacterState.MIGRATION_HINTS_FOR_TESTS,
	inventory: InventoryState.MIGRATION_HINTS_FOR_TESTS,
	wallet: WalletState.MIGRATION_HINTS_FOR_TESTS,
	prng: PRNGState.MIGRATION_HINTS_FOR_TESTS,
})

/////////////////////

export {
	GainType,
	Adventure,
	State,

	appraise_item_at_coordinates,

	create,

	play,
	equip_item,
	sell_item,
	rename_avatar,
	change_avatar_class,

	DEMO_ADVENTURE_01,
	DEMO_ADVENTURE_02,
	DEMO_STATE,
	OLDEST_LEGACY_STATE_FOR_TESTS,
	MIGRATION_HINTS_FOR_TESTS,
}

/////////////////////
