"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const definitions_1 = require("@oh-my-rpg/definitions");
const state_inventory_1 = require("@oh-my-rpg/state-inventory");
const RichText = require("@oh-my-rpg/rich-text-format");
const items_1 = require("./items");
const wallet_1 = require("./wallet");
function inventory_coordinate_to_sortable_alpha_index(coord) {
    //return (' ' + (coord + 1)).slice(-2)
    return String.fromCharCode(97 + coord);
}
function render_equipment(inventory) {
    const $doc_list = RichText.unordered_list()
        .addClass('inventory--equipment')
        .done();
    definitions_1.ITEM_SLOTS.forEach((slot) => {
        const item = state_inventory_1.get_item_in_slot(inventory, slot);
        const $doc_item = RichText.span()
            .pushText((slot + '   ').slice(0, 6))
            .pushText(': ')
            .pushNode(item
            ? items_1.render_item(item)
            : RichText.span().pushText('-').done())
            .done();
        $doc_list.$sub[slot] = $doc_item;
    });
    const $doc = RichText.section()
        .pushNode(RichText.heading().pushText('Active equipment:').done(), 'header')
        .pushNode($doc_list, 'list')
        .done();
    return $doc;
}
exports.render_equipment = render_equipment;
function render_backpack(inventory) {
    let $doc_list = RichText.ordered_list()
        .addClass('inventory--backpack')
        .done();
    const misc_items = Array.from(state_inventory_1.iterables_unslotted(inventory));
    misc_items.forEach((i, index) => {
        if (!i)
            return;
        $doc_list.$sub[inventory_coordinate_to_sortable_alpha_index(index)] = items_1.render_item(i);
        // TODO add coordinates
    });
    if (Object.keys($doc_list.$sub).length === 0) {
        // completely empty
        $doc_list.$type = RichText.NodeType.ul;
        $doc_list.$sub['-'] = RichText.span().pushText('(empty)').done();
    }
    const $doc = RichText.section()
        .pushNode(RichText.heading().pushText('backpack:').done(), 'header')
        .pushNode($doc_list, 'list')
        .done();
    return $doc;
}
exports.render_backpack = render_backpack;
function render_full_inventory(inventory, wallet) {
    const $doc = RichText.section()
        .pushNode(render_equipment(inventory), 'equipped')
        .pushNode(wallet_1.render_wallet(wallet), 'wallet')
        .pushNode(render_backpack(inventory), 'backpack')
        .done();
    return $doc;
}
exports.render_full_inventory = render_full_inventory;
//# sourceMappingURL=inventory.js.map