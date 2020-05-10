import { RendererConstructor } from './BaseRenderer'
import { DefaultContext } from './ListrInstance'

export type ListrRendererKey = 'default' | 'verbose' | 'silent'

export interface ListrOptions<TContext = DefaultContext> {
  concurrent?: boolean | number
  exitOnError?: boolean
  showSubtasks?: boolean
  collapse?: boolean
  clearOutput?: boolean
  dateFormat?: string
  renderer?: ListrRendererKey | RendererConstructor<TContext>
  nonTTYRenderer?: 'verbose' | 'silent' | RendererConstructor<TContext>
}
