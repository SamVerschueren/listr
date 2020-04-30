'use strict';
const hookStd = require('hook-std');

exports.testOutput = (t, expected) => {
	let i = 0;

	return hookStd.stdout((actual, unhook) => {
		t.is(actual, `${expected[i++]}\n`);

		if (i === expected.length) {
			unhook();
		}
	});
};
