import {hookStdout} from 'hook-std';

export const testOutput = (t, expected) => {
	let i = 0;

	return hookStdout((actual, unhook) => {
		t.is(actual, `${expected[i++]}\n`);

		if (i === expected.length) {
			unhook();
		}
	});
};
