// eslint-disable-next-line import/default
import delay from 'delay'

import Listr from '../src'

import SimpleRenderer from './SimpleRenderer'
import { makeTestOutput } from './utils'

const tasks = [
	{
		title: 'P1',
		task: () => delay(100),
	},
	{
		title: 'P2',
		task: () => delay(200),
	},
	{
		title: 'P3',
		task: () => delay(300),
	},
	{
		title: 'P4',
		task: () => delay(400),
	},
]

it('run tasks sequentially if concurrency is undefined', async () => {
	const testOutput = makeTestOutput(
		'P1 [started]',
		'P1 [completed]',
		'P2 [started]',
		'P2 [completed]',
		'P3 [started]',
		'P3 [completed]',
		'P4 [started]',
		'P4 [completed]',
		'done'
	)

	await new Listr(tasks, {
		renderer: SimpleRenderer,
	}).run()

	testOutput()
})

it('run tasks in parallel if concurrency is true', async () => {
	const testOutput = makeTestOutput(
		'P1 [started]',
		'P2 [started]',
		'P3 [started]',
		'P4 [started]',
		'P1 [completed]',
		'P2 [completed]',
		'P3 [completed]',
		'P4 [completed]',
		'done'
	)

	await new Listr(tasks, {
		renderer: SimpleRenderer,
		concurrent: true,
	}).run()

	testOutput()
})

it('run tasks in sequential parallel chunks, if concurrency is a number', async () => {
	const testOutput = makeTestOutput(
		'P1 [started]',
		'P2 [started]',
		'P1 [completed]',
		'P3 [started]',
		'P2 [completed]',
		'P4 [started]',
		'P3 [completed]',
		'P4 [completed]',
		'done'
	)

	await new Listr(tasks, {
		renderer: SimpleRenderer,
		concurrent: 2,
	}).run()

	testOutput()
})
