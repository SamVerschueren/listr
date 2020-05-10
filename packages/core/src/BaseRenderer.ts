import Task from './task'
import { ListrOptions } from './Options'
import { DefaultContext } from './ListrInstance'

export interface RendererConstructor<TContext = DefaultContext> {
  new (tasks: Task<TContext>[], options: ListrOptions<TContext>): BaseRenderer<
    TContext
  >
  nonTTY: boolean
}

export default abstract class BaseRenderer<TContext = DefaultContext> {
  static get nonTTY(): boolean {
    return false
  }

  public constructor(tasks: Task<TContext>[], options: ListrOptions<TContext>) {
    this.tasks = tasks
    this.options = options
  }

  public tasks: Task<TContext>[]
  public options: ListrOptions<TContext>

  public abstract render(): void
  public abstract end(error?: Error): void
}
