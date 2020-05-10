'use strict'
// eslint-disable-next-line import/default
import pMap from 'p-map'
import {
  ListrInstance,
  DefaultContext,
  TaskDefinition,
  ListrOptions,
  Task,
  BaseRenderer,
  RendererConstructor,
  ListrError,
  IS_LISTR_INSTANCE,
} from 'listr-core'

import { getRenderer } from './renderer'

export default class Listr<TContext = DefaultContext>
  implements ListrInstance<TContext> {
  public constructor(
    tasks?: TaskDefinition<TContext>[] | ListrOptions<TContext>,
    options?: ListrOptions<TContext>
  ) {
    let hasTasks = Boolean(tasks)
    let originalOptions: ListrOptions<TContext> | undefined = options
    if (tasks && !Array.isArray(tasks)) {
      if (typeof tasks === 'object') {
        if (
          // Waiting for TS 3.9 to fully release to fix the following 2 ignored errors
          // https://devblogs.microsoft.com/typescript/announcing-typescript-3-9-beta/#ts-expect-error-comments

          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          typeof tasks.title === 'string' &&
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          typeof tasks.task === 'function'
        ) {
          throw new TypeError(
            'Expected an array of tasks or an options object, got a task object'
          )
        }
        originalOptions = tasks
        hasTasks = false
      } else {
        throw new TypeError('Expected an array of tasks')
      }
    }

    this.originalOptions = originalOptions || {}
    this.options = {
      showSubtasks: true,
      concurrent: false,
      renderer: 'default',
      nonTTYRenderer: 'verbose',
      exitOnError: true,
      ...originalOptions,
    } as ListrOptions<TContext>
    this.tasks = []

    this.concurrency = 1
    if (this.options.concurrent === true) {
      this.concurrency = Infinity
    } else if (typeof this.options.concurrent === 'number') {
      this.concurrency = this.options.concurrent
    }

    this.RendererClass = getRenderer(
      this.options.renderer,
      this.options.nonTTYRenderer
    )

    if (hasTasks) {
      this.add((tasks as TaskDefinition<TContext>[]) || [])
    }
  }

  public readonly tasks: Task<TContext>[]
  public renderer?: BaseRenderer<TContext>

  public setRenderer(value: ListrOptions<TContext>['renderer']) {
    this.RendererClass = getRenderer(value)
  }

  public add(
    task: TaskDefinition<TContext> | TaskDefinition<TContext>[]
  ): Listr<TContext> {
    const tasks = Array.isArray(task) ? task : [task]

    for (const task of tasks) {
      this.tasks.push(new Task<TContext>(task, this.options))
    }

    return this
  }

  public render(): void {
    if (!this.renderer) {
      this.renderer = new this.RendererClass(this.tasks, this.options)
    }

    return this.renderer.render()
  }

  public async run(context?: TContext): Promise<TContext> {
    this.render()

    const ctx = context || (Object.create(null) as TContext)

    this.checkAll(ctx)

    try {
      await pMap(
        this.tasks,
        (task) => {
          this.checkAll(ctx)
          if (!task.isEnabled) {
            return Promise.resolve()
          }
          return task.run(ctx)
        },
        { concurrency: this.concurrency }
      )

      const taskErrors = this.tasks.reduce(
        (errors, task) => [...errors, ...task.errors],
        [] as Error[]
      )

      if (taskErrors.length > 0) {
        const err = new ListrError('Something went wrong')
        err.errors = taskErrors
        throw err
      }

      this?.renderer?.end?.()

      return ctx
    } catch (error) {
      error.context = ctx
      this?.renderer?.end?.(error)
      throw error
    }
  }

  public setParentTask(task: Task<TContext>): void {
    // Merge task options (parent Listr options) prioritizing own and defined options
    for (const k in task.options) {
      const key = k as keyof ListrOptions<TContext>
      if (
        task.options[key] !== undefined &&
        this.originalOptions[key] === undefined
      ) {
        this.options[key] = task.options[key] as undefined
      }
    }

    // Force silent renderer
    this.setRenderer('silent')
  }

  public [IS_LISTR_INSTANCE] = true

  protected originalOptions: ListrOptions<TContext>
  protected options: ListrOptions<TContext>
  protected concurrency: number
  protected RendererClass: RendererConstructor<TContext>

  protected checkAll(context: TContext) {
    for (const task of this.tasks) {
      task.check(context)
    }
  }
}

module.exports = Listr
