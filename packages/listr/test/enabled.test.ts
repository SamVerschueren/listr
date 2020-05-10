import Listr from '../src'

import SimpleRenderer from './SimpleRenderer'
import { makeTestOutput } from './utils'

it('do not run disabled tasks', async () => {
  const testOutput = makeTestOutput('foo [started]', 'foo [completed]', 'done')

  await new Listr<{ run: boolean }>(
    [
      {
        title: 'foo',
        task: () => Promise.resolve(),
      },
      {
        title: 'bar',
        enabled: (ctx) => ctx.run === true,
        task: () => Promise.resolve(),
      },
    ],
    {
      renderer: SimpleRenderer,
    }
  ).run()

  testOutput()
})

it('run enabled task', async () => {
  const testOutput = makeTestOutput(
    'foo [started]',
    'foo [skipped]',
    '> It failed',
    'bar [started]',
    'bar [completed]',
    'done'
  )

  await new Listr<{ failed?: boolean }>(
    [
      {
        title: 'foo',
        task: (ctx, task) =>
          Promise.reject(new Error('Something went wrong')).catch(() => {
            task.skip('It failed')

            ctx.failed = true
          }),
      },
      {
        title: 'bar',
        enabled: (ctx) => ctx.failed === true,
        task: () => Promise.resolve(),
      },
    ],
    {
      renderer: SimpleRenderer,
    }
  ).run()

  testOutput()
})
