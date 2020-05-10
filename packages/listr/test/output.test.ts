import { Observable } from 'rxjs'

import Listr from '../src'

import SimpleRenderer from './SimpleRenderer'
import { makeTestOutput } from './utils'

it('output', async () => {
  const testOutput = makeTestOutput(
    'foo [started]',
    'bar [started]',
    '> foo',
    '> bar',
    'bar [completed]',
    'foo [completed]',
    'done'
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
                return new Observable((observer) => {
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
    { renderer: SimpleRenderer }
  ).run()

  testOutput()
})
