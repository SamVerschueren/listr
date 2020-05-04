import { Observable } from 'rxjs'

import Listr from '../src'

import SimpleRenderer from './SimpleRenderer'
import TTYRenderer from './TTYRenderer'
import { makeTestOutput } from './utils'

const ttyOutput = [
	'foo [started]',
	'bar [started]',
	'> foo',
	'> bar',
	'bar [completed]',
	'foo [completed]',
	'tty done',
]

const nonTTYOutput = [
	'foo [started]',
	'bar [started]',
	'> foo',
	'> bar',
	'bar [completed]',
	'foo [completed]',
	'done',
]

it('output', async () => {
	const testOutput = makeTestOutput(
		...(process.stdout.isTTY ? ttyOutput : nonTTYOutput)
	)

	await new Listr(
		[
			{
				title: 'foo',
				task: () => {
					return new Listr([
						{
							title: 'bar',
							task: () => {
								return new Observable<string>((observer) => {
									observer.next('foo')
									observer.next('bar')
									observer.complete()
								})
							},
						},
					])
				},
			},
		],
		{
			renderer: TTYRenderer,
			nonTTYRenderer: SimpleRenderer,
		}
	).run()

	testOutput()
})
