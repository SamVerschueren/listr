import test from 'ava';
import {Observable as RxObservable} from 'rxjs/Observable';
import ZenObservable from 'zen-observable';
import Listr from '../';
import {isListr, isObservable} from '../lib/util';

test('isListr', t => {
	t.false(isListr(null));
	t.false(isListr({}));
	t.false(isListr(() => {}));
	t.true(isListr(new Listr([])));
});

test('isObservable', t => {
	t.false(isObservable(null));
	t.false(isObservable({}));
	t.false(isObservable(new Listr([])));
	t.false(isObservable(new Promise(() => {})));
	t.true(isObservable(new RxObservable(() => {})));
	t.true(isObservable(new ZenObservable(() => {})));
});
