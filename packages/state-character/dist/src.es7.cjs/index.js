"use strict";
/////////////////////
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
exports.CharacterStat = types_1.CharacterStat;
/////////////////////
const CHARACTER_STATS = [
    types_1.CharacterStat.agility,
    types_1.CharacterStat.health,
    types_1.CharacterStat.level,
    types_1.CharacterStat.luck,
    types_1.CharacterStat.mana,
    types_1.CharacterStat.strength,
    types_1.CharacterStat.vitality,
    types_1.CharacterStat.wisdom,
];
exports.CHARACTER_STATS = CHARACTER_STATS;
///////
function factory() {
    return {
        level: 1,
        health: 1,
        mana: 0,
        strength: 1,
        agility: 1,
        vitality: 1,
        wisdom: 1,
        luck: 1
    };
}
exports.factory = factory;
/////////////////////
function increase_stat(state, stat, amount = 1) {
    if (amount <= 0)
        throw new Error(`Error while increasing stat "${stat}: invalid amount!`);
    state[stat] += amount;
    return state;
}
exports.increase_stat = increase_stat;
/////////////////////
//# sourceMappingURL=index.js.map