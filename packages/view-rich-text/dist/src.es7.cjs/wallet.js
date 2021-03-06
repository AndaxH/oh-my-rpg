"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_wallet_1 = require("@oh-my-rpg/state-wallet");
const RichText = require("@oh-my-rpg/rich-text-format");
function render_currency_amount(currency, amount) {
    return RichText.span()
        .addClass('currency--' + currency)
        .pushNode(RichText.span().pushText('' + amount).done(), // TODO format according to locale?
    'amount')
        .pushText(' ' + currency + (amount === 1 ? '' : 's')) // TODO localize properly ;)
        .done();
}
exports.render_currency_amount = render_currency_amount;
function render_wallet(wallet) {
    const $doc_list = RichText.unordered_list()
        .addClass('inventory--wallet')
        .done();
    state_wallet_1.ALL_CURRENCIES.forEach((currency) => {
        const amount = state_wallet_1.get_currency_amount(wallet, currency);
        $doc_list.$sub[currency] = render_currency_amount(currency, amount);
    });
    const $doc = RichText.section()
        .pushNode(RichText.heading().pushText('Wallet:').done(), 'header')
        .pushNode($doc_list, 'list')
        .done();
    return $doc;
}
exports.render_wallet = render_wallet;
//# sourceMappingURL=wallet.js.map