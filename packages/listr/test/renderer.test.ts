import Listr from '../src'

import SimpleRenderer from './SimpleRenderer'
import { makeTestOutput } from './utils'

it('renderer class', async () => {
  const testOutput = makeTestOutput('foo [started]', 'foo [completed]', 'done')

  await new Listr(
    [
      {
        title: 'foo',
        task: () => Promise.resolve('bar'),
      },
    ],
    { renderer: SimpleRenderer }
  ).run()

  testOutput()
})
