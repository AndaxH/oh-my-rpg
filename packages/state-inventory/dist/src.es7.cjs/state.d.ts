import { InventorySlot } from '@oh-my-rpg/definitions';
import { InventoryCoordinates, Item, State } from './types';
declare function create(): State;
declare function add_item(state: State, item: Item): State;
declare function remove_item(state: State, coordinates: InventoryCoordinates): State;
declare function equip_item(state: State, coordinates: InventoryCoordinates): State;
declare function unequip_item(state: State, slot: InventorySlot): State;
declare function get_equiped_item_count(state: Readonly<State>): number;
declare function get_unequiped_item_count(state: Readonly<State>): number;
declare function get_item_count(state: Readonly<State>): number;
declare function get_item_at_coordinates(state: Readonly<State>, coordinates: InventoryCoordinates): Item | null;
declare function get_item_in_slot(state: Readonly<State>, slot: InventorySlot): Item | null;
declare function iterables_unslotted(state: Readonly<State>): IterableIterator<Item | null>;
declare const DEMO_STATE: State;
declare const OLDEST_LEGACY_STATE_FOR_TESTS: any;
declare const MIGRATION_HINTS_FOR_TESTS: any;
export { InventorySlot, InventoryCoordinates, Item, State, create, add_item, remove_item, equip_item, unequip_item, get_equiped_item_count, get_unequiped_item_count, get_item_count, get_item_at_coordinates, get_item_in_slot, iterables_unslotted, DEMO_STATE, OLDEST_LEGACY_STATE_FOR_TESTS, MIGRATION_HINTS_FOR_TESTS };
