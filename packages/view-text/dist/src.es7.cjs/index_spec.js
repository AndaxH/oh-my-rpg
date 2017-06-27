"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const definitions_1 = require("@oh-my-rpg/definitions");
const logic_weapons_1 = require("@oh-my-rpg/logic-weapons");
const logic_armors_1 = require("@oh-my-rpg/logic-armors");
const state_inventory_1 = require("@oh-my-rpg/state-inventory");
const _1 = require(".");
describe('🔠  view to text', function () {
    describe('💠  item quality rendering', function () {
        describe('color for ansi console', function () {
            it('should work', () => {
                const color = _1.get_ansi_color_for_quality(definitions_1.ItemQuality.legendary);
                expect(color).to.equal('red');
            });
        });
        describe('color for html', function () {
            it('should work', () => {
                const color = _1.get_html_color_for_quality(definitions_1.ItemQuality.uncommon);
                expect(color).to.equal('green');
            });
        });
    });
    describe('⚔  weapon rendering', function () {
        context('when not enhanced', function () {
            it('should render properly', () => {
                const str = _1.render_weapon({
                    slot: definitions_1.InventorySlot.weapon,
                    base_hid: 'luth',
                    qualifier1_hid: 'simple',
                    qualifier2_hid: 'mercenary',
                    quality: definitions_1.ItemQuality.legendary,
                    base_strength: 14,
                    enhancement_level: 0,
                });
                expect(str).to.be.a.string;
                expect(str).to.include('luth');
                expect(str).to.include('simple');
                expect(str).to.include('mercenary');
                expect(str).not.to.include('+');
                console.log(str);
            });
        });
        context('when enhanced', function () {
            it('should render properly', () => {
                const str = _1.render_weapon({
                    slot: definitions_1.InventorySlot.weapon,
                    base_hid: 'longsword',
                    qualifier1_hid: 'onyx',
                    qualifier2_hid: 'warfield_king',
                    quality: definitions_1.ItemQuality.legendary,
                    base_strength: 14,
                    enhancement_level: 3,
                });
                expect(str).to.be.a.string;
                expect(str).to.include('longsword');
                expect(str).to.include('onyx');
                expect(str).to.include('warfield_king');
                expect(str).to.include('+3');
                console.log(str);
            });
        });
    });
    describe('🛡  armor rendering', function () {
        context('when not enhanced', function () {
            it('should render properly', () => {
                const str = _1.render_armor({
                    slot: definitions_1.InventorySlot.armor,
                    base_hid: 'socks',
                    qualifier1_hid: 'onyx',
                    qualifier2_hid: 'tormentor',
                    quality: definitions_1.ItemQuality.legendary,
                    base_strength: 14,
                    enhancement_level: 0
                });
                expect(str).to.be.a.string;
                expect(str).to.include('socks');
                expect(str).to.include('onyx');
                expect(str).to.include('tormentor');
                expect(str).not.to.include('+');
                console.log(str);
            });
        });
        context('when enhanced', function () {
            it('should render properly', () => {
                const str = _1.render_armor({
                    slot: definitions_1.InventorySlot.armor,
                    base_hid: 'mantle',
                    qualifier1_hid: 'embroidered',
                    qualifier2_hid: 'warfield_king',
                    quality: definitions_1.ItemQuality.legendary,
                    base_strength: 14,
                    enhancement_level: 5
                });
                expect(str).to.be.a.string;
                expect(str).to.include('mantle');
                expect(str).to.include('embroidered');
                expect(str).to.include('warfield_king');
                expect(str).to.include('+5');
                console.log(str);
            });
        });
    });
    describe('⚔ 🛡  equipment rendering', function () {
        context('when empty', function () {
            it('should render properly', () => {
                let inventory = state_inventory_1.factory();
                const str = _1.render_equipment(inventory);
                expect(str).to.be.a.string;
                console.log(str);
            });
        });
        context('when not empty', function () {
            it('should render properly', () => {
                let inventory = state_inventory_1.factory();
                inventory = state_inventory_1.add_item(inventory, logic_weapons_1.generate_random_demo_weapon());
                inventory = state_inventory_1.add_item(inventory, logic_armors_1.generate_random_demo_armor());
                inventory = state_inventory_1.equip_item(inventory, 0);
                inventory = state_inventory_1.equip_item(inventory, 1);
                const str = _1.render_equipment(inventory);
                expect(str).to.be.a.string;
                console.log(str);
            });
        });
    });
    describe('📦  inventory rendering', function () {
        context('when empty', function () {
            it('should render properly', () => {
                let inventory = state_inventory_1.factory();
                const str = _1.render_inventory(inventory);
                expect(str).to.be.a.string;
                expect(str).to.contain(' 1.');
                expect(str).not.to.contain(' 0.');
                expect(str).to.contain('20.');
                console.log(str);
            });
        });
        context('when not empty', function () {
            it('should render properly', () => {
                let inventory = state_inventory_1.factory();
                inventory = state_inventory_1.add_item(inventory, logic_weapons_1.generate_random_demo_weapon());
                inventory = state_inventory_1.add_item(inventory, logic_weapons_1.generate_random_demo_weapon());
                inventory = state_inventory_1.add_item(inventory, logic_armors_1.generate_random_demo_armor());
                inventory = state_inventory_1.add_item(inventory, logic_weapons_1.generate_random_demo_weapon());
                inventory = state_inventory_1.add_item(inventory, logic_armors_1.generate_random_demo_armor());
                inventory = state_inventory_1.add_item(inventory, logic_armors_1.generate_random_demo_armor());
                inventory = state_inventory_1.remove_item(inventory, 4);
                const str = _1.render_inventory(inventory);
                expect(str).to.be.a.string;
                expect(str).to.contain(' 1.');
                expect(str).to.contain('20.');
                console.log(str);
            });
        });
    });
});
//# sourceMappingURL=index_spec.js.map