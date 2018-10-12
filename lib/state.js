'use strict';
const state = {
	PENDING: 0,
	COMPLETED: 1,
	FAILED: 2,
	SKIPPED: 3,
	DISABLED: 4
};

state.toString = input => {
	switch (input) {
		case state.PENDING:
			return 'pending';
		case state.COMPLETED:
			return 'completed';
		case state.FAILED:
			return 'failed';
		case state.SKIPPED:
			return 'skipped';
		case state.DISABLED:
			return 'disabled';
		default:
			return 'unknown';
	}
};

module.exports = state;
