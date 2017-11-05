import * as RichText from '@oh-my-rpg/rich-text-format'

import { generate_random_demo_weapon, DEMO_WEAPON_1, DEMO_WEAPON_2 } from '@oh-my-rpg/logic-weapons'
import { generate_random_demo_armor, DEMO_ARMOR_1, DEMO_ARMOR_2 } from '@oh-my-rpg/logic-armors'

import {
	factory as inventory_factory,
	equip_item,
	add_item,
	remove_item,
} from '@oh-my-rpg/state-inventory'

import {
	Currency,
	State as WalletState,
	factory as wallet_factory,
	add_amount,
} from '@oh-my-rpg/state-wallet'

const { rich_text_to_ansi } = require('../../../the-npm-rpg/src/v2/utils/rich_text_to_ansi')
const prettyjson = require('prettyjson')
function prettify_json(data: any, options = {}) {
	return prettyjson.render(data, options)
}

import {
	render_inventory,
	render_equipment,
	render_wallet,
	render_full_inventory,
} from '.'


describe('🔠  view to @oh-my-rpg/rich-text-format', function() {

	describe('📦  inventory rendering', function() {

		context('when empty', function() {

			it('should render properly', () => {
				let inventory = inventory_factory()
				const $doc = render_inventory(inventory)
				const str = RichText.to_text($doc)
				expect(str).to.equal('')
			})
		})

		context('when not empty', function() {

			it('should render properly', () => {
				let inventory = inventory_factory()
				inventory = add_item(inventory, generate_random_demo_weapon())
				inventory = add_item(inventory, generate_random_demo_weapon())
				inventory = add_item(inventory, generate_random_demo_armor())
				inventory = add_item(inventory, generate_random_demo_weapon())
				inventory = add_item(inventory, generate_random_demo_armor())
				inventory = add_item(inventory, generate_random_demo_armor())
				inventory = remove_item(inventory, 4)

				const $doc = render_inventory(inventory)
				const str = RichText.to_text($doc)

				expect(str).to.be.a.string
				expect(str).not.to.contain('00.')
				expect(str).to.contain('01.')
				expect(str).to.contain('05.')
				expect(str).not.to.contain('06.')
			})
		})

		describe('demo', function() {
			it('shows off', () => {
				let inventory = inventory_factory()
				inventory = add_item(inventory, generate_random_demo_weapon())
				inventory = add_item(inventory, generate_random_demo_weapon())
				inventory = add_item(inventory, generate_random_demo_armor())
				inventory = add_item(inventory, generate_random_demo_weapon())
				inventory = add_item(inventory, generate_random_demo_armor())
				inventory = add_item(inventory, generate_random_demo_armor())
				inventory = add_item(inventory, generate_random_demo_weapon())
				inventory = add_item(inventory, generate_random_demo_weapon())
				inventory = add_item(inventory, generate_random_demo_armor())
				inventory = add_item(inventory, generate_random_demo_weapon())
				inventory = add_item(inventory, generate_random_demo_armor())
				inventory = add_item(inventory, generate_random_demo_armor())
				inventory = add_item(inventory, generate_random_demo_weapon())
				inventory = add_item(inventory, generate_random_demo_weapon())
				inventory = add_item(inventory, generate_random_demo_armor())
				inventory = add_item(inventory, generate_random_demo_weapon())
				inventory = add_item(inventory, generate_random_demo_armor())
				inventory = add_item(inventory, generate_random_demo_armor())
				inventory = remove_item(inventory, 4)

				const $doc = render_inventory(inventory)
				console.log(rich_text_to_ansi($doc))
			})
		})
	})

	describe('⚔ 🛡  equipment rendering', function() {

		context('when empty', function() {

			it('should render properly', () => {
				let inventory = inventory_factory()
				const $doc = render_equipment(inventory)
				const str = RichText.to_text($doc)
				expect(str).to.be.a.string
				expect(str).to.contain('armor : -')
				expect(str).to.contain('weapon: -')
			})
		})

		context('when not empty', function() {

			it('should render properly', () => {
				let inventory = inventory_factory()
				inventory = add_item(inventory, DEMO_WEAPON_1)
				inventory = add_item(inventory, DEMO_ARMOR_2)
				inventory = equip_item(inventory, 0)
				inventory = equip_item(inventory, 0)

				const $doc = render_equipment(inventory)
				const str = RichText.to_text($doc)
				expect(str).to.be.a.string
				expect(str).to.contain('armor : legendary Apprentice’s Brass Belt +8 [4022 ↔ 4732]')
				expect(str).to.contain('weapon: uncommon Adjudicator’s Admirable Axe [19 ↔ 133]')
			})
		})

		describe('demo', function() {
			it('shows off', () => {
				let inventory = inventory_factory()
				inventory = add_item(inventory, DEMO_WEAPON_1)
				inventory = add_item(inventory, DEMO_ARMOR_2)
				inventory = equip_item(inventory, 0)
				inventory = equip_item(inventory, 0)

				const $doc = render_equipment(inventory)
				console.log(rich_text_to_ansi($doc))
			})
		})
	})

	describe('💰  wallet rendering', function() {

		context('when empty', function() {

			it('should render properly', () => {
				let wallet = wallet_factory()
				const $doc = render_wallet(wallet)
				const str = RichText.to_text($doc)

				expect(str).to.be.a.string
				expect(str).to.contain(' 0 coins')
				expect(str).to.contain(' 0 tokens')
			})
		})

		context('when not empty', function() {

			it('should render properly', () => {
				let wallet = wallet_factory()

				wallet = add_amount(wallet, Currency.coin, 12345)
				wallet = add_amount(wallet, Currency.token, 67)

				const $doc = render_wallet(wallet)
				const str = RichText.to_text($doc)

				expect(str).to.be.a.string
				expect(str).not.to.contain('0')
				expect(str).to.contain(' 12 coins')
				expect(str).to.contain(' 34 tokens')
			})
		})

		describe('demo', function() {
			it('shows off', () => {
				let wallet = wallet_factory()

				wallet = add_amount(wallet, Currency.coin, 12)
				wallet = add_amount(wallet, Currency.token, 34)

				const $doc = render_wallet(wallet)
				console.log(rich_text_to_ansi($doc))
			})
		})

	})

	describe('⚔ 🛡 💰 📦  full inventory rendering', function() {

		describe('demo', function() {
			it('shows off', () => {
				let inventory = inventory_factory()
				inventory = add_item(inventory, DEMO_WEAPON_1)
				inventory = add_item(inventory, DEMO_ARMOR_2)
				inventory = equip_item(inventory, 0)
				inventory = equip_item(inventory, 0)
				inventory = add_item(inventory, generate_random_demo_weapon())
				inventory = add_item(inventory, generate_random_demo_weapon())
				inventory = add_item(inventory, generate_random_demo_armor())
				inventory = add_item(inventory, generate_random_demo_weapon())
				inventory = add_item(inventory, generate_random_demo_armor())
				inventory = add_item(inventory, generate_random_demo_armor())
				inventory = remove_item(inventory, 4)

				let wallet = wallet_factory()
				wallet = add_amount(wallet, Currency.coin, 12345)
				wallet = add_amount(wallet, Currency.token, 67)

				const $doc = render_full_inventory(inventory, wallet)
				console.log(rich_text_to_ansi($doc))
			})
		})

	})

})
