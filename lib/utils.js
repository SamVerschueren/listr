import {isStream as objectIsStream} from 'is-stream';
import objectIsObservable from 'is-observable';

// RxJS@6 symbol (https://github.com/sindresorhus/is-observable/issues/1#issuecomment-387843191)
const symbolObservable = typeof Symbol === 'function' && Symbol.observable || '@@observable';		// eslint-disable-line no-mixed-operators

export const isObservable = object => Boolean(object && object[symbolObservable] && object === object[symbolObservable]()) || objectIsObservable(object);
export const isListr = object => Boolean(object && object.setRenderer && object.add && object.run);
export const isStream = object => objectIsStream(object) && !isObservable(object);
