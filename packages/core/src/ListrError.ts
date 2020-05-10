import { DefaultContext } from './ListrInstance'

export default class ListrError<TContext = DefaultContext> extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ListrError'
    this.errors = []
  }

  public errors: Error[]
  public context?: TContext
}
