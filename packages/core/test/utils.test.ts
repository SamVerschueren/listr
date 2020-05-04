/* eslint-disable @typescript-eslint/no-empty-function */
import { Observable as RxObservable } from 'rxjs'
import ZenObservable from 'zen-observable'

import { tryCastListrInstance, isObservable } from '../src/utils'
import { IS_LISTR_INSTANCE } from '../src/symbols'
import { ListrObservable } from '../src/Observable'

const listrInstance = { [IS_LISTR_INSTANCE]: true }

it('isListr', () => {
	expect(tryCastListrInstance(null)).toBeFalsy()
	expect(tryCastListrInstance({})).toBeFalsy()
	expect(tryCastListrInstance(() => {})).toBeFalsy()
	expect(tryCastListrInstance(listrInstance)).toBeTruthy()
})

it('isObservable', () => {
	expect(isObservable(null)).toBeFalsy()
	expect(isObservable({})).toBeFalsy()
	expect(isObservable(listrInstance)).toBeFalsy()
	expect(isObservable(new Promise(() => {}))).toBeFalsy()
	expect(
		isObservable(new RxObservable(() => {}) as ListrObservable<unknown>)
	).toBeTruthy()
	expect(
		isObservable(new ZenObservable(() => {}) as ListrObservable<unknown>)
	).toBeTruthy()
})
