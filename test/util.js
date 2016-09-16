import test from 'ava';
import {Observable as RxObservable} from 'rxjs/Observable';
import ZenObservable from 'zen-observable';
import Listr from '../';
import {isListr, isObservable} from '../lib/util';

test('isListr', t => {
	t.falsy(isListr(null));
	t.falsy(isListr({}));
	t.falsy(isListr(() => {}));
	t.truthy(isListr(new Listr([])));
});

test('isObservable', t => {
	t.falsy(isObservable(null));
	t.falsy(isObservable({}));
	t.falsy(isObservable(new Listr([])));
	t.falsy(isObservable(new Promise(() => {})));
	t.truthy(isObservable(new RxObservable(() => {})));
	t.truthy(isObservable(new ZenObservable(() => {})));
});
