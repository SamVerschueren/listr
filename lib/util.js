'use strict';

const isListr = obj => obj && obj.setRenderer && obj.add && obj.run;
// https://github.com/sindresorhus/is-observable/issues/1
const isObservable = obj => obj && typeof obj.subscribe === 'function' && obj.constructor.name === 'Observable';

exports.isListr = isListr;
exports.isObservable = isObservable;
