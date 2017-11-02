#!/bin/sh
':' //# http://sambal.org/?p=1014 ; exec /usr/bin/env node "$0" "$@"
"use strict";

const readline = require('readline')
const termSize = require('term-size')
const { indent_string, wrap_string, prettify_json } = require('../libs')
const { prettify_params_for_debug, get_shared_start } = require('../utils')


const MANY_BOX_HORIZ = '────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────'
const MANY_SPACES = '                                                                                                                                                                  '
const LIB = 'view-chat/tty'

function alpha_to_nice_unicode(char) {
	return ' ' + char + '\u20e3'
}

function key_to_string(key) {
	return key.name
}


function factory({DEBUG, shouldCenter}) {
	if (DEBUG) console.log('↘ tty_chat_ui_factory()')
	const state = {
		is_closing: false,
		keypress_callback: null,
	}

	if (!process.stdout.isTTY)
		throw new Error('start_loop: current term is not a tty !')

	const {columns: TERM_WIDTH} = termSize()
	if (DEBUG) console.log({TERM_WIDTH})
	if (TERM_WIDTH < 40)
		throw new Error('Your terminal is too narrow!')
	const USED_WIDTH = Math.min(TERM_WIDTH, 80)
	const MSG_WIDTH = USED_WIDTH <= 50
		? USED_WIDTH
		: Math.max(50, Math.round(USED_WIDTH * .5))
	if (DEBUG) console.log({USED_WIDTH, MSG_WIDTH})
	const MSG_BASELINE = MANY_BOX_HORIZ.slice(0, MSG_WIDTH - 2)
	const MSG_L_INDENT = shouldCenter
		? Math.round((TERM_WIDTH - USED_WIDTH) / 2)
		: 0
	const MSG_R_INDENT = MSG_L_INDENT + USED_WIDTH - MSG_WIDTH
	const PROMPT = MANY_SPACES.slice(0, MSG_L_INDENT + 2)

	process.stdin.setRawMode(true)
	readline.emitKeypressEvents(process.stdin)

	const rli = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: PROMPT,
	})

	rli.on('line', (input) => {
		if (DEBUG) console.log(`[Received line: ${input}]`);
	})

	rli.on('close', () => {
		if (DEBUG) console.log(`[Received close]`);
		state.is_closing = true
	})

	process.stdin.on('keypress', (str, key_pressed) => {
		if (DEBUG) console.log(`[keypress]`);
		if (!state.keypress_callback)
			return
		if (state.is_closing)
			return

		if (DEBUG) console.log(`[key pressed:\n${prettify_json(key_pressed)}\n]`)
		if (!key_pressed) {
			if (DEBUG) console.error('keypress: Y U no key?!')
			return
		}

		key_pressed.name = key_pressed.name || key_pressed.sequence
		state.keypress_callback(key_pressed)
	})
	rli.prompt()
	// TODO
	// global exit key


	function decorate_choices_with_key(step) {
		// init
		step.choices.forEach(choice => {
			choice._ui_tty = choice._ui_tty || {}
		})

		const affected_keys = new Set()
		const unhinted_choices = []

		// 1st follow hints, provided they don't collide
		const seen_key_hints = new Set()
		step.choices.forEach(choice => {
			if (!choice.key_hint) {
				unhinted_choices.push(choice)
				return
			}

			const key_hash = key_to_string(choice.key_hint)
			if (seen_key_hints.has(key_hash)) {
				// collision between hints
				if (DEBUG) console.log(`collision between key hints for key "${key_hash}"!`)
				// ignore hint for this choice
				unhinted_choices.push(choice)
				return
			}

			seen_key_hints.add(key_hash)
			affected_keys.add(key_hash)

			choice.key = choice.key_hint
		})

		// naive affectation for unhinted ones (may collide)
		unhinted_choices.forEach(choice => {
			choice._ui_tty.key = {
					name: choice.msg_cta.toLowerCase()[0]
				}
		})

		// find colliding choices with same key
		function find_unaffected_key(hintstr) {
			hintstr = hintstr + 'abcdefghijklmnopqrstuvwxyz1234567890'
			for (let i=0; i < hintstr.length; i++) {
				let candidate_key = {
					name: hintstr.charAt(i)
				}
				let candidate_keystr = key_to_string(candidate_key)
				if (!affected_keys.has(candidate_keystr))
					return candidate_key
			}
			throw new Error(`${LIB}: couldn't find any keystroke, no letter left...`)
		}

		let have_collisions = false
		let potentially_colliding_choices = unhinted_choices
		do {
			have_collisions = false

			const groups = {}
			potentially_colliding_choices.forEach(choice => {
				const key_hash = key_to_string(choice._ui_tty.key)
				groups[key_hash] = groups[key_hash] || []
				groups[key_hash].push(choice)
				if (groups[key_hash].length > 1)
					have_collisions = true
			})

			if (!have_collisions)
				break

			potentially_colliding_choices = []

			Object.keys(groups).forEach(key_hash => {
				if (groups[key_hash].length === 1) {
					// perfect, no collision
					affected_keys.add(key_hash)
					return
				}

				// collision
				const colliding_choices = groups[key_hash]
				const common_value_part = get_shared_start(colliding_choices.map(choice => choice.msg_cta.toLowerCase()))
				colliding_choices.forEach(choice => {
					let candidate_key = {
						name: choice.msg_cta.toLowerCase().slice(common_value_part.length)[0]
					}
					let candidate_key_hash = key_to_string(candidate_key)

					if (affected_keys.has(candidate_key_hash)) {
						// find another one
						candidate_key = find_unaffected_key(hintstr)
						candidate_key_hash = key_to_string(candidate_key)
					}
					choice._ui_tty.key = candidate_key
					affected_keys.add(candidate_key_hash)
				})
			})
		} while(have_collisions)

		const allowed_keys = step.choices.map(choice => choice._ui_tty.key.name).join(',')
		if (DEBUG) console.log('  available choices: ' + allowed_keys)
	}



	function render_choice(choice) {
		const {msg_cta} = choice
		const {key} = choice._ui_tty
		const nice_key = alpha_to_nice_unicode(key.name)
		return `${nice_key} ${msg_cta}`
	}

	async function display_message({msg, choices = [], side = '→'}) {
		if (DEBUG) console.log(`↘ display_message(\n${prettify_params_for_debug({msg, choices, side})}\n)`)
		if (typeof arguments[0] !== 'object')
			throw new Error(`display_message(): incorrect invocation!`)
		if (!msg)
			throw new Error(`display_message(): no msg!`)
		msg = wrap_string(msg, MSG_WIDTH - 1)
		msg = indent_string(msg, 1, {indent: '│'})

		const has_choices = choices && choices.length > 0
		if (!has_choices) {
			msg += '\n└─' + MSG_BASELINE
		}
		else {
			msg += '\n└┬' + MSG_BASELINE
			decorate_choices_with_key({choices})
			choices.forEach((choice, index) => {
				if (index === choices.length - 1)
					msg += '\n └' + render_choice(choice)
				else
					msg += '\n ├' + render_choice(choice)
			})
		}

		let indent_col_count = 0
		switch(side) {
			case '→':
				indent_col_count = MSG_L_INDENT
				break
			case '←':
				indent_col_count = MSG_R_INDENT
				break
			case '↔':
			default:
				throw new Error(`display_message(): incorrect side!`)
				break
		}
		msg = indent_string(
			msg,
			indent_col_count,
			{indent: ' '}
		)

		console.log(msg)
	}

	function read_string(step) {
		if (DEBUG) console.log(`↘ read_string(\n${prettify_params_for_debug(step)}\n)`)
		return new Promise(resolve => {
				//rli.clearLine(process.stdout, 0)
				rli.prompt()

				rli.question('', answer => {
					rli.clearLine(process.stdout, 0)
					answer = String(answer).trim()
					if (DEBUG) console.log(`[You entered: "${answer}"]`)
					resolve(answer)
				})
			})
			.then(answer => {
				if (step.msgg_as_user)
					return display_message({
							msg: step.msgg_as_user(answer),
							side: '←'
						})
						.then(() => answer)

				return answer
			})
	}

	function read_key_sequence() {
		if (DEBUG) console.log('↘ read_key_sequence()')
		return new Promise(resolve => {
			//process.stdin.setRawMode(true)
			rli.prompt()
			state.keypress_callback = key => {
				//process.stdin.setRawMode(false)
				state.keypress_callback = null
				rli.clearLine(process.stdout, 0)
				resolve(key)
			}
		})
			.catch(() => process.stdin.setRawMode(false))
	}

	async function read_choice(step) {
		if (DEBUG) console.log('↘ read_choice()')
		const allowed_keys = step.choices.map(choice => choice._ui_tty.key.name).join(',')
		if (DEBUG) console.log('  available choices: ' + allowed_keys)
		let answer = undefined
		while (typeof answer === 'undefined') {
			const key = await read_key_sequence()
			const choice = step.choices.find(choice => choice._ui_tty.key.name === key.name)
			if(!choice) {
				console.log(`[please select a correct choice: ${allowed_keys}]`)
			}
			else {
				answer = choice.value
				// TODO display here ?
				await display_message({
					msg: (choice.msgg_as_user || step.msgg_as_user || (() => choice.msg_cta))(answer),
					// () => choice.msg_cta
					// x => String(x)
					side: '←'
				})
			}
		}
		return answer
	}

	async function read_answer(step) {
		if (DEBUG) console.log('↘ read_answer()')
		switch (step.type) {
			case 'ask_for_string':
				return read_string(step)
			case 'ask_for_choice':
				return read_choice(step)
			/*
			case 'confirm':

			if (step.msgg_confirm) {
				ok = await ask_user_for_confirmation(step.msgg_confirm(answer))
				if (DEBUG) console.log(`↖ ask_user(…) confirmation = "${ok}"`)
			}
			 */
			default:
				throw new Error(`Unsupported step type: "${step.type}"!`)
		}
	}

	async function teardown() {
		if (DEBUG) console.log('↘ teardown()')
		rli.close()
	}

	return {
		setup: () => {console.log('')},
		display_message,
		read_answer,
		teardown,
	}
}


module.exports = {
	factory,
}