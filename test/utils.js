const test = require('ava');
const {Observable: RxObservable} = require('rxjs');
const ZenObservable = require('zen-observable');
const {isListr, isObservable} = require('../lib/utils');
const Listr = require('..');

test('isListr', t => {
	t.false(isListr(null));
	t.false(isListr({}));
	t.false(isListr(() => {}));
	t.true(isListr(new Listr([])));
});

console.log(isObservable(new RxObservable(() => {})));

test('isObservable', t => {
	t.false(isObservable(null));
	t.false(isObservable({}));
	t.false(isObservable(new Listr([])));
	t.false(isObservable(new Promise(() => {})));
	t.true(isObservable(new RxObservable(() => {})));
	t.true(isObservable(new ZenObservable(() => {})));
});
