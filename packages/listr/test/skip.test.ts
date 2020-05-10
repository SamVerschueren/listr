import Listr from '../src'

import SimpleRenderer from './SimpleRenderer'
import { makeTestOutput } from './utils'

it('continue execution if skip() returns false or Promise for false', async () => {
  const task = jest.fn()

  await new Listr(
    [
      {
        title: 'Task 1',
        task: () =>
          new Listr([
            {
              title: 'Task 1.1',
              task,
            },
            {
              title: 'Task 1.2',
              skip: () => false,
              task,
            },
            {
              title: 'Task 1.3',
              task,
            },
          ]),
      },
      {
        title: 'Task 2',
        skip: () => Promise.resolve(false),
        task,
      },
      {
        title: 'Task 3',
        task,
      },
    ],
    { renderer: 'silent' }
  ).run()

  expect(task).toHaveBeenCalledTimes(5)
})

it('skip task if skip() returns true or Promise for true', async () => {
  const task = jest.fn()

  await new Listr(
    [
      {
        title: 'Task 1',
        task: () =>
          new Listr([
            {
              title: 'Task 1.1',
              task,
            },
            {
              title: 'Task 1.2',
              skip: () => true,
              task: () => {
                throw new Error('Skipped task should not be executed')
              },
            },
            {
              title: 'Task 1.3',
              task,
            },
          ]),
      },
      {
        title: 'Task 2',
        skip: () => Promise.resolve(true),
        task: () => {
          throw new Error('Skipped task should not be executed')
        },
      },
      {
        title: 'Task 3',
        task,
      },
    ],
    { renderer: 'silent' }
  ).run()

  expect(task).toHaveBeenCalledTimes(3)
})

it('skip task with custom reason if skip() returns string or Promise for string', async () => {
  const task = jest.fn()

  await new Listr(
    [
      {
        title: 'Task 1',
        task: () =>
          new Listr([
            {
              title: 'Task 1.1',
              task,
            },
            {
              title: 'Task 1.2',
              skip: () => 'skip',
              task: () => {
                throw new Error('Skipped task should not be executed')
              },
            },
            {
              title: 'Task 1.3',
              task,
            },
          ]),
      },
      {
        title: 'Task 2',
        skip: () => Promise.resolve('skip'),
        task,
      },
      {
        title: 'Task 3',
        task,
      },
    ],
    { renderer: 'silent' }
  ).run()

  expect(task).toHaveBeenCalledTimes(3)
})

it('skip rendering', async () => {
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
        skip: () => 'foo bar',
        task: () => Promise.resolve('foo bar'),
      },
    ],
    { renderer: SimpleRenderer }
  ).run()

  testOutput()
})

it('skip context object', async () => {
  await new Listr<{ foo: 'bar' }>(
    [
      {
        title: 'foo',
        task: (ctx) => {
          ctx.foo = 'bar'
        },
      },
      {
        title: 'bar',
        skip: (ctx) => {
          expect(ctx.foo).toBe('bar')
          return false
        },
        task: (ctx) => {
          expect(ctx.foo).toBe('bar')
        },
      },
    ],
    { renderer: 'silent' }
  ).run()
})
