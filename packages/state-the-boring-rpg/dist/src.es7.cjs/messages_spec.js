"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_prng_1 = require("@oh-my-rpg/state-prng");
const RichText = require("@oh-my-rpg/rich-text-format");
const _1 = require(".");
describe.only('⚔ 👑 😪  The Boring RPG - contextual messages', function () {
    beforeEach(() => state_prng_1.xxx_internal_reset_prng_cache());
    describe('get recap', function () {
        context('when the user has just started a new game', function () {
            it('should return an intro', () => {
                const state = _1.factory();
                const doc = _1.get_recap(state);
                const str = RichText.to_text(doc);
                expect(str).to.include('A great saga just started');
            });
        });
    });
    describe('get tip', function () {
        context('when the user has just started a new game', function () {
            it('should suggest to play', () => {
                const state = _1.factory();
                const doc = _1.get_tip(state);
                const str = RichText.to_text(doc);
                console.log(str);
                expect('' + str).to.include('Tip:');
                expect('' + str).to.include('select play');
            });
        });
    });
});
//# sourceMappingURL=messages_spec.js.map