"use strict";

const Conf = require('conf')

const { migrate_to_latest } = require('@oh-my-rpg/state-the-boring-rpg')

const { prettify_json_for_debug } = require('./utils/debug')

/////////////////////////////////////////////////

function init_savegame({verbose}) {
	const config = new Conf({
		configName: 'state',
		defaults: {},
	})

	if (verbose) console.log('config path:', config.path)
	if (verbose) console.log('loaded state:', prettify_json_for_debug(config.store))

	const state = migrate_to_latest(config.store)
	if (verbose) console.log('migrated state:', prettify_json_for_debug(state))

	config.clear()
	config.set(state)

	return config
}

/////////////////////////////////////////////////

module.exports = {
	init_savegame,
}
