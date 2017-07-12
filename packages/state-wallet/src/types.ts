import { Enum } from 'typescript-string-enums'

/////////////////////

const Currency = Enum(
	'coin',
	'token',
)
type Currency = Enum<typeof Currency>

/////////////////////

interface State {
	coin_count: number
	token_count: number
}

/////////////////////

export {
	Currency,
	State,
}

/////////////////////
