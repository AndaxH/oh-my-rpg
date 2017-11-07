"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_prng_1 = require("@oh-my-rpg/state-prng");
const logic_adventures_1 = require("@oh-my-rpg/logic-adventures");
const state_the_boring_rpg_1 = require("@oh-my-rpg/state-the-boring-rpg");
const { rich_text_to_ansi } = require('../../../the-npm-rpg/src/utils/rich_text_to_ansi');
const _1 = require(".");
const prettyjson = require('prettyjson');
function prettify_json(data, options = {}) {
    return prettyjson.render(data, options);
}
describe('📃  adventure rendering', function () {
    it('should render properly - simple case', () => {
        const adventure = {
            hid: 'dying_man',
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
        };
        const $doc = _1.render_adventure(adventure);
        //console.log(prettify_json($doc))
        const str = rich_text_to_ansi($doc);
        console.log(str);
        expect(str).to.be.a.string;
        expect(str).to.include('A dying man on the street left you everything he had.');
        expect(str).to.include('You gained');
        expect(str).to.include('1234 coins');
    });
    describe('adventures', function () {
        beforeEach(() => state_prng_1.xxx_internal_reset_prng_cache());
        logic_adventures_1.ALL_GOOD_ADVENTURE_ARCHETYPES
            .forEach(({ hid, good }, index) => {
            describe(`${good ? '✅' : '🚫'}  adventure #${index} "${hid}"`, function () {
                it('should be playable', () => {
                    let state = state_the_boring_rpg_1.factory();
                    state = state_the_boring_rpg_1.play(state, hid);
                    const $doc = _1.render_adventure(state.last_adventure);
                    //console.log(prettify_json($doc))
                    const str = rich_text_to_ansi($doc);
                    //console.log(str)
                    // should just not throw
                });
            });
        });
    });
});
//# sourceMappingURL=adventure_spec.js.map