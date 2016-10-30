'use strict';
const hookStd = require('hook-std');

exports.testOutput = (t, expected) => {
	t.plan(expected.length);
	let i = 0;

	const unhook = hookStd(actual => {
		t.is(actual, `${expected[i++]}\n`);

		if (i === expected.length) {
			unhook();
		}
	});
};
