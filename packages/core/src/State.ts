enum StateValue {
  INITIALIZED = -1,
  PENDING = 0,
  COMPLETED = 1,
  FAILED = 2,
  SKIPPED = 3,
}

export default class ListrState {
  protected constructor(value = StateValue.INITIALIZED) {
    this.value = value
  }

  public value: StateValue

  public [Symbol.toStringTag](): string {
    switch (this.value) {
      case StateValue.PENDING:
        return 'pending'
      case StateValue.COMPLETED:
        return 'completed'
      case StateValue.FAILED:
        return 'failed'
      case StateValue.SKIPPED:
        return 'skipped'
      default:
        return 'unknown'
    }
  }

  public [Symbol.toPrimitive](hint: 'number' | 'string' | 'default') {
    if (hint === 'string') {
      return this[Symbol.toStringTag]()
    }

    return this.value
  }

  public static INITIALIZED = new ListrState(StateValue.INITIALIZED)
  public static PENDING = new ListrState(StateValue.PENDING)
  public static COMPLETED = new ListrState(StateValue.COMPLETED)
  public static FAILED = new ListrState(StateValue.FAILED)
  public static SKIPPED = new ListrState(StateValue.SKIPPED)
}
