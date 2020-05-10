import { BaseRenderer, DefaultContext } from 'listr-core'

export default class SilentRenderer<
  TContext = DefaultContext
> extends BaseRenderer<TContext> {
  static get nonTTY(): boolean {
    return true
  }

  render() {
    return
  }

  end() {
    return
  }
}
