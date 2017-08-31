import { CharacterStat, CharacterClass, State } from './types';
declare const CHARACTER_STATS: string[];
declare function factory(): State;
declare function rename(state: State, new_name: string): State;
declare function switch_class(state: State, klass: CharacterClass): State;
declare function increase_stat(state: State, stat: CharacterStat, amount?: number): State;
export { CharacterStat, CharacterClass, State, CHARACTER_STATS, factory, rename, switch_class, increase_stat };
