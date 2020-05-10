import { IS_LISTR_INSTANCE } from './symbols'
import Task from './task'

export type DefaultContext = {}

export interface ListrInstance<TContext = DefaultContext> {
  [IS_LISTR_INSTANCE]: boolean

  tasks: Task<TContext>[]

  setParentTask(task: Task<TContext>): void
  run(context: TContext): Promise<TContext>
}
