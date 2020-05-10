import { ListrError, TaskDefinition } from 'listr-core'

import Listr from '../src'

import SimpleRenderer from './SimpleRenderer'
import { makeTestOutput } from './utils'

describe('exits on error', () => {
  let testOutput: (innerExpected?: string[]) => void
  let task1: jest.Mock<Promise<void>>
  let task2: jest.Mock<Promise<void>>

  let tasks: TaskDefinition[]

  beforeEach(() => {
    testOutput = makeTestOutput()
    task1 = jest.fn(() => Promise.reject(new Error('Something went wrong')))
    task2 = jest.fn(() => Promise.resolve())
    tasks = [
      {
        title: 'foo',
        task: task1,
      },
      {
        title: 'bar',
        task: task2,
      },
    ]
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('exit on error', async () => {
    const list = new Listr(tasks, {
      renderer: SimpleRenderer,
    })

    await expect(list.run()).rejects.toThrowError('Something went wrong')
    expect(task1).toHaveBeenCalled()
    expect(task2).not.toHaveBeenCalled()

    testOutput([
      'foo [started]',
      'foo [failed]',
      '> Something went wrong',
      'done',
    ])
  })

  it('set `exitOnError` to false', async () => {
    const list = new Listr(tasks, {
      exitOnError: false,
      renderer: SimpleRenderer,
    })

    await expect(list.run()).rejects.toThrowError({
      name: Error.name,
      message: 'Something went wrong',
      errors: [
        {
          name: Error.name,
          message: 'Something went wrong',
        },
      ],
    } as ListrError)

    expect(task1).toHaveBeenCalled()
    expect(task2).toHaveBeenCalled()

    testOutput([
      'foo [started]',
      'foo [failed]',
      '> Something went wrong',
      'bar [started]',
      'bar [completed]',
      'done',
    ])
  })

  it('set `exitOnError` to false in nested list', async () => {
    const taskFoo = jest.fn(() => Promise.resolve())
    const taskUnicorn = jest.fn(() =>
      Promise.reject(new Error('Unicorn failed'))
    )
    const taskRainbow = jest.fn(() => Promise.resolve())
    const taskBaz = jest.fn(() => Promise.resolve())

    const list = new Listr(
      [
        {
          title: 'foo',
          task: taskFoo,
        },
        {
          title: 'bar',
          task: () => {
            return new Listr(
              [
                {
                  title: 'unicorn',
                  task: taskUnicorn,
                },
                {
                  title: 'rainbow',
                  task: taskRainbow,
                },
              ],
              {
                exitOnError: false,
              }
            )
          },
        },
        {
          title: 'baz',
          task: taskBaz,
        },
      ],
      {
        renderer: SimpleRenderer,
      }
    )

    await expect(list.run()).rejects.toThrowError({
      name: Error.name,
      message: 'Something went wrong',
      errors: [
        {
          name: Error.name,
          message: 'Unicorn failed',
        },
      ],
    } as ListrError)

    testOutput([
      'foo [started]',
      'foo [completed]',
      'bar [started]',
      'unicorn [started]',
      'unicorn [failed]',
      '> Unicorn failed',
      'rainbow [started]',
      'rainbow [completed]',
      'bar [failed]',
      'done',
    ])

    expect(taskFoo).toHaveBeenCalled()
    expect(taskUnicorn).toHaveBeenCalled()
    expect(taskRainbow).toHaveBeenCalled()
    expect(taskBaz).not.toHaveBeenCalled()
  })

  it('set `exitOnError` to false in root', async () => {
    const taskFoo = jest.fn(() => Promise.reject(new Error('Foo failed')))
    const taskUnicorn = jest.fn(() =>
      Promise.reject(new Error('Unicorn failed'))
    )
    const taskRainbow = jest.fn(() => Promise.resolve())
    const taskBaz = jest.fn(() => Promise.resolve())

    const list = new Listr(
      [
        {
          title: 'foo',
          task: taskFoo,
        },
        {
          title: 'bar',
          task: () => {
            return new Listr([
              {
                title: 'unicorn',
                task: taskUnicorn,
              },
              {
                title: 'rainbow',
                task: taskRainbow,
              },
            ])
          },
        },
        {
          title: 'baz',
          task: taskBaz,
        },
      ],
      {
        exitOnError: false,
        renderer: SimpleRenderer,
      }
    )

    await expect(list.run()).rejects.toThrowError({
      name: 'ListrError',
      message: 'Something went wrong',
      errors: [
        {
          name: Error.name,
          message: 'Foo failed',
        },
        {
          name: Error.name,
          message: 'Unicorn failed',
        },
      ],
    } as ListrError)

    expect(taskFoo).toHaveBeenCalled()
    expect(taskUnicorn).toHaveBeenCalled()
    expect(taskRainbow).toHaveBeenCalled()
    expect(taskBaz).toHaveBeenCalled()

    testOutput([
      'foo [started]',
      'foo [failed]',
      '> Foo failed',
      'bar [started]',
      'unicorn [started]',
      'unicorn [failed]',
      '> Unicorn failed',
      'rainbow [started]',
      'rainbow [completed]',
      'bar [failed]',
      'baz [started]',
      'baz [completed]',
      'done',
    ])
  })

  it('set `exitOnError` to false in root and true in child', async () => {
    const taskFoo = jest.fn(() => Promise.reject(new Error('Foo failed')))
    const taskUnicorn = jest.fn(() =>
      Promise.reject(new Error('Unicorn failed'))
    )
    const taskRainbow = jest.fn(() => Promise.resolve())
    const taskBaz = jest.fn(() => Promise.resolve())

    const list = new Listr(
      [
        {
          title: 'foo',
          task: taskFoo,
        },
        {
          title: 'bar',
          task: () => {
            return new Listr(
              [
                {
                  title: 'unicorn',
                  task: taskUnicorn,
                },
                {
                  title: 'rainbow',
                  task: taskRainbow,
                },
              ],
              { exitOnError: true }
            )
          },
        },
        {
          title: 'baz',
          task: taskBaz,
        },
      ],
      {
        exitOnError: false,
        renderer: SimpleRenderer,
      }
    )

    await expect(list.run()).rejects.toThrowError({
      name: 'ListrError',
      message: 'Something went wrong',
      errors: [
        {
          name: Error.name,
          message: 'Foo failed',
        },
        {
          name: Error.name,
          message: 'Unicorn failed',
        },
      ],
    } as ListrError)

    expect(taskFoo).toHaveBeenCalled()
    expect(taskUnicorn).toHaveBeenCalled()
    expect(taskRainbow).not.toHaveBeenCalled()
    expect(taskBaz).toHaveBeenCalled()

    testOutput([
      'foo [started]',
      'foo [failed]',
      '> Foo failed',
      'bar [started]',
      'unicorn [started]',
      'unicorn [failed]',
      '> Unicorn failed',
      'bar [failed]',
      '> Unicorn failed',
      'baz [started]',
      'baz [completed]',
      'done',
    ])
  })

  it('exit on error throws error object with context', async () => {
    type Context = { foo?: 'bar' }

    const taskFoo = jest.fn(() => Promise.reject(new Error('Foo failed')))
    const taskBar = jest.fn((ctx: Context): void => {
      ctx.foo = 'bar'
    })

    const list = new Listr<Context>(
      [
        {
          title: 'foo',
          task: taskFoo,
        },
        {
          title: 'bar',
          task: taskBar,
        },
      ],
      {
        exitOnError: false,
        renderer: SimpleRenderer,
      }
    )

    await expect(list.run()).rejects.toThrowError({
      name: 'ListrError',
      message: 'Something went wrong',
      errors: [
        {
          name: Error.name,
          message: 'Foo failed',
        },
      ],
      context: { foo: 'bar' },
    } as ListrError<Context>)

    expect(taskFoo).toHaveBeenCalled()
    expect(taskBar).toHaveBeenCalled()

    testOutput([
      'foo [started]',
      'foo [failed]',
      '> Foo failed',
      'bar [started]',
      'bar [completed]',
      'done',
    ])
  })
})
