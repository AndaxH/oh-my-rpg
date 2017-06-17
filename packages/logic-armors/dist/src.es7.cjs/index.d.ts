import { Engine } from '@offirmo/random';
import { ArmorPartType, Armor } from './types';
declare const MAX_ENHANCEMENT_LEVEL = 8;
declare const MIN_STRENGTH = 1;
declare const MAX_STRENGTH = 20;
declare function factory(rng: Engine, hints?: Partial<Armor>): Armor;
declare function generate_random_demo_armor(): Armor;
declare function enhance_armor(armor: Armor): Armor;
export { ArmorPartType, Armor, MAX_ENHANCEMENT_LEVEL, MIN_STRENGTH, MAX_STRENGTH, factory, generate_random_demo_armor, enhance_armor };
