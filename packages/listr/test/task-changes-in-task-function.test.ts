import Listr from '../src'

import SimpleRenderer from './SimpleRenderer'
import { makeTestOutput } from './utils'

it('changing the title during task execution', async () => {
  const testOutput = makeTestOutput(
    'foo [started]',
    'foo bar [title changed]',
    'foo bar [completed]',
    'done'
  )

  await new Listr(
    [
      {
        title: 'foo',
        task: (_, task) => {
          task.title = 'foo bar'
        },
      },
    ],
    { renderer: SimpleRenderer }
  ).run()

  testOutput()
})

it('changing the output during task execution', async () => {
  const testOutput = makeTestOutput(
    'foo [started]',
    '> some output',
    'foo [completed]',
    'done'
  )

  await new Listr(
    [
      {
        title: 'foo',
        task: (ctx, task) => {
          task.output = 'some output'
        },
      },
    ],
    { renderer: SimpleRenderer }
  ).run()

  testOutput()
})

it('skip task during task execution with no message', async () => {
  const testOutput = makeTestOutput('foo [started]', 'foo [skipped]', 'done')

  await new Listr(
    [
      {
        title: 'foo',
        task: (ctx, task) => {
          task.skip()
        },
      },
    ],
    { renderer: SimpleRenderer }
  ).run()

  testOutput()
})

it('skip task during task execution with message', async () => {
  const testOutput = makeTestOutput(
    'foo [started]',
    'foo [skipped]',
    '> foo bar',
    'done'
  )
  await new Listr(
    [
      {
        title: 'foo',
        task: (ctx, task) => {
          task.skip('foo bar')
        },
      },
    ],
    { renderer: SimpleRenderer }
  ).run()

  testOutput()
})

it('skip subtask', async () => {
  const testOutput = makeTestOutput(
    'foo [started]',
    'bar [started]',
    'bar [skipped]',
    '> foo bar',
    'foo [completed]',
    'done'
  )

  await new Listr(
    [
      {
        title: 'foo',
        task: () =>
          new Listr(
            [
              {
                title: 'bar',
                task: (ctx, task) => {
                  task.skip('foo bar')
                },
              },
            ],
            { renderer: SimpleRenderer }
          ),
      },
    ],
    { renderer: SimpleRenderer }
  ).run()

  testOutput()
})
