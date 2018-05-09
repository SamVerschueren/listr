'use strict';
const isStream = require('is-stream');

// TODO https://github.com/sindresorhus/is-observable/issues/1
const isObservable = obj => Boolean(obj && typeof obj.subscribe === 'function' && obj.constructor.name === 'Observable');

exports.isListr = obj => Boolean(obj && obj.setRenderer && obj.add && obj.run);
exports.isObservable = obj => isObservable(obj);
exports.isStream = obj => isStream(obj) && !isObservable(obj);
