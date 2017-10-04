
import { xxx_internal_reset_prng_cache } from '@oh-my-rpg/state-prng'
import { ALL_GOOD_ADVENTURE_ARCHETYPES } from '@oh-my-rpg/logic-adventures'
import {
	get_unequiped_item_count,
	get_equiped_item_count,
	get_item_at_coordinates,
} from '@oh-my-rpg/state-inventory'

import {
	Currency,
	get_currency_amount,
} from '@oh-my-rpg/state-wallet'

import {
	VERSION,
	factory,
	migrate_to_latest,
	play,
} from '.'

describe('⚔ 👑 😪  The Boring RPG', function() {
	beforeEach(() => xxx_internal_reset_prng_cache())

	describe('🆕 initial state', function() {

		it('should be correct', function() {
			const state = factory()

			// check presence of sub-states
			expect(state).to.have.property('meta')
			expect(state).to.have.property('avatar')
			expect(state).to.have.property('inventory')
			expect(state).to.have.property('wallet')
			expect(state).to.have.property('prng')

			// init of custom values
			expect(state).to.have.property('click_count', 0)
			expect(state).to.have.property('good_click_count', 0)
			expect(state).to.have.property('meaningful_interaction_count', 0)
			expect(state.last_adventure).to.be.null

			// check our 2 predefined items are present and equipped
			expect(get_equiped_item_count(state.inventory), 'equipped').to.equal(2)
			expect(get_unequiped_item_count(state.inventory), 'unequipped').to.equal(0)
		})
	})

	describe('XXX savegame migration', function() {

		context('when the version is more recent', function() {
			it('should throw with a meaningful error', () => {
				function load() {
					migrate_to_latest({
						version: 99999
					})
				}
				expect(load).to.throw('more recent version')
			})
		})

		context('when the version is up to date', function() {
			it('should return the state without change', () => {
				const state = {
					version: VERSION,
					foo: 42
				}
				expect(migrate_to_latest(state)).to.deep.equal({
					version: VERSION,
					foo: 42
				})
			})
		})

		context('when the version is outdated', function() {
			it('TODO should migrate to latest version')
		})
	})

	describe('👆🏾 user actions', function() {

		describe('🤘🏽 play', function() {

			context('🚫  when the cooldown has NOT passed', function() {
				it('should generate a negative adventure')
				it('should not decrease user stats')
				it('should punish the user by increasing the cooldown')
				it('may actually result in a good outcome (idea)')
			})

			context('✅  when the cooldown has passed', function() {

				it('should sometime generate a story adventure', () => {
					const state = play(factory())

					expect(state.last_adventure).not.to.be.null
					expect(state.last_adventure!.good).to.be.true
				})

				it('should correctly increment counters', () => {
					const state = play(factory())

					expect(state).to.have.property('click_count', 1)
					expect(state).to.have.property('good_click_count', 1)
					expect(state).to.have.property('meaningful_interaction_count', 1)
				})

				it('should sometime generate a fight adventure', () => {
					let fightCount = 0
					let state = factory()
					for(let i = 0; i < 20; ++i) {
						state = play(state)
						if (state.last_adventure!.hid.startsWith('fight_'))
							fightCount++
					}
					expect(fightCount).to.be.above(3)
				})

				context('when the adventure is a story', function() {

					describe('the outcome', function() {

						it('should sometime be a coin gain', () => {
							let state = factory()
							state = play(state, 'dying_man')

							// we got money
							expect(get_currency_amount(state.wallet, Currency.coin)).to.be.above(0)
						})

						it('should sometime be a token gain')
						it('should sometime be a stat gain')
						it('should sometime be an item gain', () => {
							let state = factory()
							state = play(state, 'rare_goods_seller')

							// check our 2 predefined items are still present and equipped
							expect(get_equiped_item_count(state.inventory), 'equipped').to.equal(2)
							// a new item is present
							expect(get_unequiped_item_count(state.inventory), 'unequipped').to.equal(1)
							// it's a weapon !
							expect(get_item_at_coordinates(state.inventory, 0)).to.have.property('slot', 'armor')
						})
						it('should sometime be an item improvement')
					})
				})

				context('when the adventure is a fight', function() {

					it('should generate a suitable enemy', () => {
						let state = factory()
						state.avatar.attributes.level = 500
						for(let i = 0; i < 20; ++i) {
							state = play(state)
							if (state.last_adventure!.hid.startsWith('fight_'))
								break
						}
						console.log(state.last_adventure)
						expect(state.last_adventure!.encounter).to.exist
						expect(state.last_adventure!.encounter!.level).to.be.within(400, 600)
					})
				})
			})
		})

		describe('inventory management', function() {

			it('should allow un-equiping an item') // not now, but useful for ex. for immediately buying a better item on the market

			it('should allow equiping an item, correctly swapping with an already equiped item')

			it('should allow selling an item')
		})
	})

	describe('adventures', function() {
		ALL_GOOD_ADVENTURE_ARCHETYPES.forEach(({hid, good}) => {
			describe(`${good ? '✅' : '🚫'}  adventure "${hid}"`, function() {
				it('should be playable', () => {
					let state = factory()
					state = play(state, hid)
				})
			})
		})
	})
})
