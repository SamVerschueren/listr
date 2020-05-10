import type { Stream } from 'stream'

import Task from './Task'
import type { ListrObservable } from './Observable'
import type { DefaultContext, ListrInstance } from './ListrInstance'

export type TaskFunctionResult<TContext> =
  | unknown
  | Promise<unknown>
  | ListrObservable<string>
  | ListrInstance<TContext>
  | Stream

export type TaskFunction<TContext = DefaultContext> = (
  context: TContext,
  task: Task<TContext>
) => TaskFunctionResult<TContext>

export type SkipTaskFunction<TContext = DefaultContext> = (
  context: TContext,
  task: Task<TContext>
) => boolean | string | Promise<string | boolean>

export type EnabledTaskFunction<TContext = DefaultContext> = (
  context: TContext,
  task: Task<TContext>
) => boolean

export interface TaskDefinition<TContext = DefaultContext> {
  title: string
  task: TaskFunction<TContext>
  skip?: SkipTaskFunction<TContext>
  enabled?: EnabledTaskFunction<TContext>
}
