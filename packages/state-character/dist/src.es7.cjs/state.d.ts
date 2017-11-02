import { CharacterAttribute, CharacterClass, CharacterAttributes, State } from './types';
declare const CHARACTER_STATS: ("agility" | "health" | "level" | "luck" | "mana" | "strength" | "charisma" | "wisdom")[];
declare function factory(): State;
declare function rename(state: State, new_name: string): State;
declare function switch_class(state: State, klass: CharacterClass): State;
declare function increase_stat(state: State, stat: CharacterAttribute, amount?: number): State;
declare const DEMO_STATE: State;
declare const OLDEST_LEGACY_STATE_FOR_TESTS: any;
declare const MIGRATION_HINTS_FOR_TESTS: any;
export { CharacterAttribute, CharacterClass, CharacterAttributes, State, CHARACTER_STATS, factory, rename, switch_class, increase_stat, DEMO_STATE, OLDEST_LEGACY_STATE_FOR_TESTS, MIGRATION_HINTS_FOR_TESTS };