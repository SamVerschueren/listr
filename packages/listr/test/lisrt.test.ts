/* eslint-disable @typescript-eslint/ban-ts-ignore */
// All @ts-ignore statements here should be replaced by @ts-expect-error TypeScript 3.9 is out
/* eslint-disable @typescript-eslint/no-explicit-any */
import Listr from '../src'

it('create', () => {
  expect(() => new Listr()).not.toThrow()
  // @ts-ignore
  expect(() => new Listr('foo')).toThrowError('Expected an array of tasks')

  let list: Listr

  list = new Listr([
    {
      title: 'foo',
      task: () => {
        return
      },
    },
  ])
  expect((list as any).tasks).toHaveLength(1)
  expect((list as any).options.showSubtasks).toBe(true)
  expect((list as any).options.concurrent).toBe(false)

  list = new Listr({ showSubtasks: false, concurrent: true })
  expect((list as any).tasks).toHaveLength(0)
  expect((list as any).options.showSubtasks).toBe(false)
  expect((list as any).options.concurrent).toBe(true)

  list = new Listr(
    [
      {
        title: 'foo',
        task: () => {
          return
        },
      },
    ],
    {
      showSubtasks: false,
      concurrent: true,
    }
  )
  expect((list as any).tasks).toHaveLength(1)
  expect((list as any).options.showSubtasks).toBe(false)
  expect((list as any).options.concurrent).toBe(true)
})

test('throw error if task properties are wrong', () => {
  // @ts-ignore
  expect(() => new Listr([{}])).toThrowError(
    'Expected property `title` to be of type `string`, got `undefined`'
  )
  // @ts-ignore
  expect(() => new Listr([{ title: 5 }])).toThrowError(
    'Expected property `title` to be of type `string`, got `number`'
  )
  // @ts-ignore
  expect(() => new Listr([{ title: 'foo' }])).toThrowError(
    'Expected property `task` to be of type `function`, got `undefined`'
  )
  // @ts-ignore
  expect(() => new Listr([{ title: 'foo', task: 'bar' }])).toThrowError(
    'Expected property `task` to be of type `function`, got `string`'
  )

  expect(
    () =>
      new Listr([
        {
          title: 'foo',
          task: () => {
            return
          },
          // @ts-ignore
          skip: 5,
        },
      ])
  ).toThrowError(
    'Expected property `skip` to be of type `function`, got `number`'
  )
  expect(
    () =>
      new Listr([
        {
          title: 'foo',
          task: () => {
            return
          },
          // @ts-ignore
          enabled: 5,
        },
      ])
  ).toThrowError(
    'Expected property `enabled` to be of type `function`, got `number`'
  )
})

test('throw error if a task object is provided', () => {
  expect(
    () =>
      new Listr({
        // @ts-ignore
        title: 'foo',
        task: () => {
          return
        },
      })
  ).toThrowError(
    'Expected an array of tasks or an options object, got a task object'
  )
})

test('`.addTask()` throws if task properties are wrong', () => {
  const list = new Listr()
  expect(list.add.bind(list)).toThrowError('Expected a task')
  expect(list.add.bind(list, {})).toThrowError(
    'Expected property `title` to be of type `string`, got `undefined`'
  )
  expect(list.add.bind(list, { title: 5 })).toThrowError(
    'Expected property `title` to be of type `string`, got `number`'
  )
  expect(list.add.bind(list, { title: 'foo' })).toThrowError(
    'Expected property `task` to be of type `function`, got `undefined`'
  )
  expect(list.add.bind(list, { title: 'foo', task: 'bar' })).toThrowError(
    'Expected property `task` to be of type `function`, got `string`'
  )
  expect(
    list.add.bind(list, {
      title: 'foo',
      task: () => {
        return
      },
      skip: 5,
    })
  ).toThrowError(
    'Expected property `skip` to be of type `function`, got `number`'
  )
  expect(
    list.add.bind(list, {
      title: 'foo',
      task: () => {
        return
      },
      enabled: 5,
    })
  ).toThrowError(
    'Expected property `enabled` to be of type `function`, got `number`'
  )
})

test('throw error if task rejects', async () => {
  const list = new Listr(
    [
      {
        title: 'foo',
        task: () => Promise.reject(new Error('foo bar')),
      },
    ],
    { renderer: 'silent' }
  )

  await expect(async () => {
    await list.run()
  }).rejects.toThrowError('foo bar')
})

test('throw error if task throws', async () => {
  const list = new Listr(
    [
      {
        title: 'foo',
        task: () => {
          throw new Error('foo bar')
        },
      },
    ],
    { renderer: 'silent' }
  )

  await expect(async () => {
    await list.run()
  }).rejects.toThrowError('foo bar')
})

test('throw error if task skip rejects', async () => {
  const list = new Listr(
    [
      {
        title: 'foo',
        skip: () => Promise.reject(new Error('skip foo')),
        task: () => {
          return
        },
      },
    ],
    { renderer: 'silent' }
  )

  await expect(list.run()).rejects.toThrowError('skip foo')
})

test('throw error if task skip throws', async () => {
  const list = new Listr(
    [
      {
        title: 'foo',
        skip: () => {
          throw new Error('skip foo')
        },
        task: () => {
          return
        },
      },
    ],
    { renderer: 'silent' }
  )

  await expect(list.run()).rejects.toThrowError('skip foo')
})

test('execute tasks', async () => {
  const list = new Listr(
    [
      {
        title: 'foo',
        task: () => Promise.resolve('bar'),
      },
    ],
    { renderer: 'silent' }
  )

  await expect(list.run()).resolves.toEqual({})
})

test('add tasks', () => {
  const task = () => {
    return
  }
  const list = new Listr()
    .add({ title: 'foo', task })
    .add([
      { title: 'hello', task },
      { title: 'world', task },
    ])
    .add({ title: 'bar', task })

  expect((list as any).tasks).toHaveLength(4)
})

test('context', async () => {
  const list = new Listr<{ foo?: string }>(
    [
      {
        title: 'foo',
        task: (context) => {
          context.foo = 'bar'
        },
      },
      {
        title: 'unicorn',
        task: (context) => {
          expect(context.foo).toBe('bar')
        },
      },
    ],
    { renderer: 'silent' }
  )

  const result = await list.run()

  expect(result).toEqual({
    foo: 'bar',
  })
})

test('subtask context', async () => {
  const list = new Listr<{ foo: string; fiz?: string }>(
    [
      {
        title: 'foo',
        task: () => {
          return new Listr<{ foo: string; fiz?: string }>([
            {
              title: 'subfoo',
              task: (context) => {
                expect(context.foo).toBe('bar')
                context.fiz = 'biz'
              },
            },
          ])
        },
      },
      {
        title: 'bar',
        task: (context) => {
          expect(context.fiz).toBe('biz')
        },
      },
    ],
    { renderer: 'silent' }
  )

  const result = await list.run({ foo: 'bar' })

  expect(result).toEqual({
    foo: 'bar',
    fiz: 'biz',
  })
})

test('context is attached to error object', async () => {
  const list = new Listr<{ foo: string }>(
    [
      {
        title: 'foo',
        task: (context) => {
          context.foo = 'bar'
        },
      },
      {
        title: 'unicorn',
        task: () => Promise.reject(new Error('foo bar')),
      },
    ],
    { renderer: 'silent' }
  )

  await expect(list.run()).rejects.toThrowError({
    name: Error.name,
    message: 'foo bar',
    context: {
      foo: 'bar',
    },
  } as Error)
})
