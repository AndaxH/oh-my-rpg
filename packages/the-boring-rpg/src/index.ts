import { Random, Engine } from '@offirmo/random'

/////////////////////

import {
	InventorySlot,
	ItemQuality,
	Item,
} from '@oh-my-rpg/definitions'

import {
	CharacterStat,
	State as CharacterState,
	factory as character_state_factory,
	increase_stat,
} from '@oh-my-rpg/state-character'


import {
	State as InventoryState,
	InventoryCoordinates,
	factory as inventory_state_factory,
	add_item as inventory_add_item,
	equip_item as inventory_equip_item,
	unequip_item as inventory_unequip_item,
	get_item_in_slot,
} from '@oh-my-rpg/state-inventory'

import {
	factory as prng_state_factory,
	set_seed as prng_set_seed,
	update_use_count as prng_update_use_count,
	get_prng,
} from '@oh-my-rpg/state-prng'

import {
	Weapon,
	factory as weapon_factory,
	enhance as enhance_weapon,
	MAX_ENHANCEMENT_LEVEL as MAX_WEAPON_ENHANCEMENT_LEVEL,
} from '@oh-my-rpg/logic-weapons'

import {
	Armor,
	factory as armor_factory,
	enhance as enhance_armor,
	MAX_ENHANCEMENT_LEVEL as MAX_ARMOR_ENHANCEMENT_LEVEL,
} from '@oh-my-rpg/logic-armors'

import {
	CoinsGain,
	AdventureArchetype,

	pick_random_good_archetype,
	pick_random_bad_archetype,
	generate_random_coin_gain,
} from '@oh-my-rpg/logic-adventures'

import {
	State,
	Adventure,
} from './types'

/////////////////////

function factory(): State {
	let state = {
		characteristics: character_state_factory(),
		inventory: inventory_state_factory(),
		prng: prng_state_factory(),
	}

	let prng = get_prng(state.prng)

	const start_weapon = weapon_factory(prng, {
		base_hid: 'spoon',
		qualifier1_hid: 'used',
		qualifier2_hid: 'noob',
		quality: ItemQuality.common,
		base_strength: 1,
	})
	state = receive_item(state, start_weapon)
	state = equip_item(state, 0)

	const start_armor = armor_factory(prng, {
		base_hid: 'socks',
		qualifier1_hid: 'used',
		qualifier2_hid: 'noob',
		quality: 'common',
	})
	state = receive_item(state, start_armor)
	state = equip_item(state, 0)

	//state.prng = prng_update_use_count(state.prng, prng)

	return state
}

/////////////////////

function instantiate_adventure_archetype(rng: Engine, aa: AdventureArchetype, player_level: number, inventory: InventoryState): Adventure {
	const {hid, good, post: { gains : {
		level: should_gain_a_level,
		agility,
		health,
		luck,
		mana,
		strength,
		vitality,
		wisdom,
		coins: coins_gain,
		tokens,
		armor: should_receive_armor,
		weapon: should_receive_weapon,
		armor_improvement: improved_armor,
		weapon_improvement: improved_weapon,
	}}} = aa

	const new_player_level = player_level + (should_gain_a_level ? 1 : 0)
	const weapon = should_receive_weapon
		? weapon_factory(rng)
		: null
	const armor = should_receive_armor
		? armor_factory(rng)
		: null

	return {
		hid,
		good,
		gains: {
			level: should_gain_a_level ? 1 : 0,
			health,
			mana,
			strength,
			agility,
			vitality,
			wisdom,
			luck,
			coins: generate_random_coin_gain(rng, coins_gain, new_player_level),
			tokens,
			weapon,
			armor,
			improved_weapon,
			improved_armor,
		}
	}
}

function generate_random_good_adventure(rng: Engine, player_level: number, inventory: InventoryState): Adventure {
	const aa: AdventureArchetype = pick_random_good_archetype(rng)

	return instantiate_adventure_archetype(
		rng,
		aa,
		player_level,
		inventory,
	)

}

function receive_item(state: State, item: Item): State {
	// TODO handler inventory full
	state.inventory = inventory_add_item(state.inventory, item)
	return state
}

function play_good(state: State): State {
	const adventure = generate_random_good_adventure(
		state.prng,
		state.characteristics.level,
		state.inventory,
	)

	const {hid, gains : {
		level,
		health,
		mana,
		strength,
		agility,
		vitality,
		wisdom,
		luck,
		coins,
		tokens,
		weapon,
		armor,
		improved_weapon,
		improved_armor,
	}} = adventure

	// TODO store hid for no repetition

	if (level) increase_stat(state.characteristics, CharacterStat.level)
	if (health) increase_stat(state.characteristics, CharacterStat.health, health)
	if (mana) increase_stat(state.characteristics, CharacterStat.mana, mana)
	if (strength) increase_stat(state.characteristics, CharacterStat.strength, strength)
	if (agility) increase_stat(state.characteristics, CharacterStat.agility, agility)
	if (vitality) increase_stat(state.characteristics, CharacterStat.vitality, vitality)
	if (wisdom) increase_stat(state.characteristics, CharacterStat.wisdom, wisdom)
	if (luck) increase_stat(state.characteristics, CharacterStat.luck, luck)

	// TODO wallet

	if (weapon) receive_item(state, weapon)
	if (armor) receive_item(state, armor)

	if (improved_weapon) {
		let weapon_to_enhance = get_item_in_slot(state.inventory, InventorySlot.weapon) as Weapon
		if (weapon_to_enhance && weapon_to_enhance.enhancement_level < MAX_WEAPON_ENHANCEMENT_LEVEL)
			enhance_weapon(weapon_to_enhance)
		// TODO enhance another weapon as fallback
	}
	if (improved_armor) {
		const armor_to_enhance = get_item_in_slot(state.inventory, InventorySlot.armor) as Armor
		if (armor_to_enhance && armor_to_enhance.enhancement_level < MAX_ARMOR_ENHANCEMENT_LEVEL)
			enhance_armor(armor_to_enhance)
		// TODO enhance another armor as fallback
	}

	return state
}

/////////////////////

function play(state: State): State {
	// TODO good / bad

	return play_good(state)
}

function equip_item(state: State, coordinates: InventoryCoordinates): State {
	state.inventory = inventory_equip_item(state.inventory, coordinates)
	return state
}

function unequip_item(state: State, slot: InventorySlot): State {
	state.inventory = inventory_unequip_item(state.inventory, slot)
	return state
}

/////////////////////

export {
	factory
}

/////////////////////
