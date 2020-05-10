import { IS_LISTR_INSTANCE } from './symbols'
import Task from './Task'

export type DefaultContext = {}

export interface ListrInstance<TContext = DefaultContext> {
  [IS_LISTR_INSTANCE]?: boolean

  tasks: Task<TContext>[]

  setParentTask(task: Task<TContext>): void
  run(context: TContext): Promise<TContext>
}
