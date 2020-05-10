import Listr from '../src'

import SimpleRenderer from './SimpleRenderer'
import { makeTestOutput } from './utils'

it('renderer class', async () => {
  const testOutput = makeTestOutput(
    'foo [started]',
    'bar [started]',
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
                return
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
