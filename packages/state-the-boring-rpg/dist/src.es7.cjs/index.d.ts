import { InventorySlot } from '@oh-my-rpg/definitions';
import { InventoryCoordinates } from '@oh-my-rpg/state-inventory';
import { VERSION, State, Adventure } from './types';
declare function factory(): State;
declare function migrate_to_latest(state: any): State;
declare function play(state: State, explicit_adventure_archetype_hid?: string): State;
declare function equip_item(state: State, coordinates: InventoryCoordinates): State;
declare function unequip_item(state: State, slot: InventorySlot): State;
declare function sell_item(state: State, coordinates: InventoryCoordinates): State;
export { VERSION, Adventure, State, factory, migrate_to_latest, play, equip_item, unequip_item, sell_item };
