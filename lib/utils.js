'use strict';
const isStream = require('is-stream');

// RxJS@6 symbol (https://github.com/sindresorhus/is-observable/issues/1#issuecomment-387843191)
const symbolObservable = typeof Symbol === 'function' && Symbol.observable || '@@observable';		// eslint-disable-line no-mixed-operators

const isObservable = object => Boolean(object && object[symbolObservable] && object === object[symbolObservable]()) || require('is-observable')(object);

exports.isListr = object => Boolean(object && object.setRenderer && object.add && object.run);
exports.isObservable = object => isObservable(object);
exports.isStream = object => isStream(object) && !isObservable(object);
