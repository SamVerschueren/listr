'use strict'
import type { Stream } from 'stream'

import isPromise from 'is-promise'
import streamToObservable from '@samverschueren/stream-to-observable'

import ListrError from './ListrError'
import type {
  TaskDefinition,
  TaskFunctionResult,
  SkipTaskFunction,
} from './TaskDefinition'
import { tryCastListrInstance, isStream, isObservable } from './utils'
import type { DefaultContext } from './ListrInstance'
import type { ListrObservable, ListrObserver } from './Observable'
import type { ListrEvent } from './Event'
import ListrState from './state'
import { ListrOptions } from './Options'

const defaultSkipFn = () => false

export default class Task<TContext = DefaultContext>
  implements
    Omit<TaskDefinition<TContext>, 'skip'>,
    ListrObservable<ListrEvent>,
    ListrObserver<ListrEvent> {
  constructor(
    definition: TaskDefinition<TContext>,
    options: ListrOptions<TContext>
  ) {
    if (!definition) {
      throw new TypeError('Expected a task')
    }

    if (typeof definition.title !== 'string') {
      throw new TypeError(
        `Expected property \`title\` to be of type \`string\`, got \`${typeof definition.title}\``
      )
    }

    if (typeof definition.task !== 'function') {
      throw new TypeError(
        `Expected property \`task\` to be of type \`function\`, got \`${typeof definition.task}\``
      )
    }

    if (definition.skip && typeof definition.skip !== 'function') {
      throw new TypeError(
        `Expected property \`skip\` to be of type \`function\`, got \`${typeof definition.skip}\``
      )
    }

    if (definition.enabled && typeof definition.enabled !== 'function') {
      throw new TypeError(
        `Expected property \`enabled\` to be of type \`function\`, got \`${typeof definition.enabled}\``
      )
    }

    this.skipFn = definition.skip || defaultSkipFn

    this._title = definition.title
    this.task = definition.task
    this.enabled = definition.enabled
    this.subtasks = []
    this.errors = []
    this.subscriptions = []
    this.isEnabled = true
    this.options = options
    this._state = ListrState.INITIALIZED
  }

  public options: ListrOptions<TContext>
  public task: TaskDefinition<TContext>['task']
  public skipFn: SkipTaskFunction<TContext>
  public enabled: TaskDefinition<TContext>['enabled']
  public isEnabled: boolean
  public subtasks: Task<TContext>[]
  public errors: Error[]
  public spinner?: () => string

  public get state() {
    return this._state
  }

  public set state(state: ListrState) {
    this._state = state

    this.next({ type: 'STATE' })
  }

  public get title() {
    return this._title
  }

  public set title(title) {
    this._title = title

    this.next({
      type: 'TITLE',
      data: title,
    })
  }

  public get output(): string | undefined {
    return this._output
  }

  public set output(data: string | undefined) {
    this._output = data

    this.next({
      type: 'DATA',
      data,
    })
  }

  public hasSubtasks() {
    return this.subtasks.length > 0
  }

  public isPending() {
    return this.state === ListrState.PENDING
  }

  public isSkipped() {
    return this.state === ListrState.SKIPPED
  }

  public isCompleted() {
    return this.state === ListrState.COMPLETED
  }

  public hasFailed() {
    return this.state === ListrState.FAILED
  }

  public next(value: ListrEvent): void {
    for (const observer of this.subscriptions) {
      observer?.next?.(value)
    }
  }

  public complete(): void {
    for (const observer of this.subscriptions) {
      observer?.complete?.()
    }
    this.clearSubscriptions()
  }

  public error(error: Error): void {
    for (const observer of this.subscriptions) {
      observer?.error?.(error)
    }
    this.clearSubscriptions()
  }

  public subscribe(
    observer: ListrObserver<ListrEvent>
  ): { unsubscribe: () => void } {
    this.subscriptions.push(observer)

    return {
      unsubscribe: () => {
        const index = this.subscriptions.indexOf(observer)

        if (index) {
          this.subscriptions.splice(index, 1)
        }
      },
    }
  }

  public check(context: TContext) {
    // Check if a task is enabled or disabled
    if (this.state === ListrState.INITIALIZED && this.enabled) {
      const isEnabled = this.enabled(context, this)

      if (this.isEnabled !== isEnabled) {
        this.isEnabled = isEnabled

        this.next({
          type: 'ENABLED',
          data: isEnabled,
        })
      }
    }
  }

  public report(error: Error) {
    if (error instanceof ListrError) {
      for (const err of error.errors) {
        this.errors.push(err)
      }
    } else {
      this.errors.push(error)
    }
  }

  public skip(message?: string) {
    if (message && typeof message !== 'string') {
      throw new TypeError(
        `Expected \`message\` to be of type \`string\`, got \`${typeof message}\``
      )
    }

    if (message) {
      this._output = message
    }

    this.state = ListrState.SKIPPED
  }

  public run(context: TContext) {
    const handleResult = (
      result: TaskFunctionResult<TContext>
    ): TaskFunctionResult<TContext> => {
      // Detect the subtask
      const listrInstance = tryCastListrInstance<TContext>(result)
      if (listrInstance) {
        listrInstance.setParentTask(this)
        this.subtasks = listrInstance.tasks

        this.next({
          type: 'SUBTASKS',
        })

        return listrInstance.run(context)
      }

      let observable: ListrObservable<string> | undefined = undefined
      let promise: Promise<void | string> | undefined = undefined

      // Detect stream
      if (isStream(result)) {
        observable = streamToObservable<ListrObservable<string>>(
          result as Stream
        )
      }

      // Detect Observable
      if (isObservable(result)) {
        observable = result as ListrObservable<string>
      }

      if (observable) {
        const obs = observable
        promise = new Promise<void>((resolve, reject) => {
          obs.subscribe({
            next: (value) => {
              this.output = value
            },
            error: reject,
            complete: resolve,
          })
        })
      }

      // Detect promise
      if (isPromise(result as Promise<void | string>)) {
        promise = result as Promise<void | string>
      }

      if (promise) {
        return promise.then(handleResult)
      }

      return result
    }

    return Promise.resolve()
      .then(() => {
        this.state = ListrState.PENDING
        return this.skipFn(context, this)
      })
      .then((skipped) => {
        if (skipped) {
          if (typeof skipped === 'string') {
            this._output = skipped
          }

          this.state = ListrState.SKIPPED
          return
        }

        return handleResult(this.task(context, this))
      })
      .then(() => {
        if (this.isPending()) {
          this.state = ListrState.COMPLETED
        }
      })
      .catch((error) => {
        this.state = ListrState.FAILED

        if (error instanceof ListrError) {
          this.report(error)
        } else {
          if (!this.hasSubtasks()) {
            // Do not show the message if we have subtasks as the error is already shown in the subtask
            this._output = error.message
          }

          this.next({
            type: 'DATA',
            data: error.message,
          })

          this.report(error)
        }

        // Do not exit when explicitely set to `false`
        if (this.options.exitOnError !== false) {
          this.error(error)
          throw error
        }
      })
      .then(() => {
        // Mark the Observable as completed
        this.complete()
      })
  }

  protected _title: string
  protected _output?: string
  protected _state: ListrState
  protected subscriptions: ListrObserver<ListrEvent>[]

  protected clearSubscriptions(): void {
    this.subscriptions = []
  }
}
