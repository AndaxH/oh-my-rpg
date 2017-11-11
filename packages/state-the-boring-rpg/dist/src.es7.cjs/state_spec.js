"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_prng_1 = require("@oh-my-rpg/state-prng");
const logic_adventures_1 = require("@oh-my-rpg/logic-adventures");
const state_inventory_1 = require("@oh-my-rpg/state-inventory");
const state_wallet_1 = require("@oh-my-rpg/state-wallet");
const consts_1 = require("./consts");
const _1 = require(".");
describe('⚔ 👑 😪  The Boring RPG - reducer', function () {
    beforeEach(() => state_prng_1.xxx_internal_reset_prng_cache());
    describe('🆕  initial state', function () {
        it('should be correct', function () {
            const state = _1.create();
            expect(Object.keys(state)).to.have.lengthOf(11); // this test should be updated if that changes
            // check presence of sub-states
            expect(state, 'meta').to.have.property('meta');
            expect(state, 'avatar').to.have.property('avatar');
            expect(state, 'inventory').to.have.property('inventory');
            expect(state, 'wallet').to.have.property('wallet');
            expect(state, 'prng').to.have.property('prng');
            // init of custom values
            expect(state).to.have.property('schema_version', consts_1.SCHEMA_VERSION);
            expect(state).to.have.property('revision', 0);
            expect(state).to.have.property('click_count', 0);
            expect(state).to.have.property('good_click_count', 0);
            expect(state).to.have.property('meaningful_interaction_count', 0);
            expect(state.last_adventure).to.be.null;
            // check our 2 predefined items are present and equipped
            expect(state_inventory_1.get_equiped_item_count(state.inventory), 'equipped').to.equal(2);
            expect(state_inventory_1.get_unequiped_item_count(state.inventory), 'unequipped').to.equal(0);
        });
    });
    describe('👆🏾 user actions', function () {
        describe('🤘🏽 play', function () {
            context('🚫  when the cooldown has NOT passed', function () {
                it('should generate a negative adventure');
                it('should not decrease user stats');
                it('should punish the user by increasing the cooldown');
                it('may actually result in a good outcome (idea)');
            });
            context('✅  when the cooldown has passed', function () {
                it('should sometime generate a story adventure', () => {
                    const state = _1.play(_1.create());
                    expect(state.last_adventure).not.to.be.null;
                    expect(state.last_adventure.good).to.be.true;
                });
                it('should correctly increment counters', () => {
                    const state = _1.play(_1.create());
                    expect(state).to.have.property('click_count', 1);
                    expect(state).to.have.property('good_click_count', 1);
                    expect(state).to.have.property('meaningful_interaction_count', 1);
                });
                it('should sometime generate a fight adventure', () => {
                    let fightCount = 0;
                    let state = _1.create();
                    for (let i = 0; i < 20; ++i) {
                        state = _1.play(state);
                        if (state.last_adventure.hid.startsWith('fight_'))
                            fightCount++;
                    }
                    expect(fightCount).to.be.above(3);
                });
                context('when the adventure is a story', function () {
                    describe('the outcome', function () {
                        it('should sometime be a coin gain', () => {
                            let state = _1.create();
                            state = _1.play(state, 'dying_man');
                            // we got money
                            expect(state_wallet_1.get_currency_amount(state.wallet, state_wallet_1.Currency.coin)).to.be.above(0);
                        });
                        it('should sometime be a token gain');
                        it('should sometime be a stat gain');
                        it('should sometime be an item gain', () => {
                            let state = _1.create();
                            state = _1.play(state, 'rare_goods_seller');
                            // check our 2 predefined items are still present and equipped
                            expect(state_inventory_1.get_equiped_item_count(state.inventory), 'equipped').to.equal(2);
                            // a new item is present
                            expect(state_inventory_1.get_unequiped_item_count(state.inventory), 'unequipped').to.equal(1);
                            // it's a weapon !
                            expect(state_inventory_1.get_item_at_coordinates(state.inventory, 0)).to.have.property('slot', 'armor');
                        });
                        it('should sometime be an item improvement');
                    });
                });
                context('when the adventure is a fight', function () {
                    it('should generate a suitable enemy', () => {
                        let state = _1.create();
                        state.avatar.attributes.level = 500;
                        for (let i = 0; i < 20; ++i) {
                            state = _1.play(state);
                            if (state.last_adventure.hid.startsWith('fight_'))
                                break;
                        }
                        //console.log(state.last_adventure)
                        expect(state.last_adventure.encounter).to.exist;
                        expect(state.last_adventure.encounter.level).to.be.within(400, 600);
                    });
                });
            });
        });
        describe('inventory management', function () {
            it('should allow un-equiping an item'); // not now, but useful for ex. for immediately buying a better item on the market
            it('should allow equiping an item, correctly swapping with an already equiped item');
            it('should allow selling an item');
        });
    });
    describe('adventures', function () {
        logic_adventures_1.ALL_GOOD_ADVENTURE_ARCHETYPES.forEach(({ hid, good }) => {
            describe(`${good ? '✅' : '🚫'}  adventure "${hid}"`, function () {
                it('should be playable', () => {
                    let state = _1.create();
                    state = _1.play(state, hid);
                });
            });
        });
    });
});
//# sourceMappingURL=state_spec.js.map