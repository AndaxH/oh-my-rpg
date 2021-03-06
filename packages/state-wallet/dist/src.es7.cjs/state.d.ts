import { Currency, State } from './types';
declare const ALL_CURRENCIES: string[];
declare function create(): State;
declare function add_amount(state: State, currency: Currency, amount: number): State;
declare function remove_amount(state: State, currency: Currency, amount: number): State;
declare function get_currency_amount(state: Readonly<State>, currency: Currency): number;
declare function iterables_currency(state: Readonly<State>): IterableIterator<string>;
declare const DEMO_STATE: State;
declare const OLDEST_LEGACY_STATE_FOR_TESTS: any;
declare const MIGRATION_HINTS_FOR_TESTS: any;
export { Currency, State, ALL_CURRENCIES, create, add_amount, remove_amount, get_currency_amount, iterables_currency, DEMO_STATE, OLDEST_LEGACY_STATE_FOR_TESTS, MIGRATION_HINTS_FOR_TESTS };
