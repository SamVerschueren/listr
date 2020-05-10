// eslint-disable-next-line import/default
import isAStream from 'is-stream'

import type { ListrObservable } from './Observable'
import type { ListrInstance } from './ListrInstance'
import { IS_LISTR_INSTANCE } from './symbols'

export const isObservable = (object: unknown): boolean => {
  const candidate = object as ListrObservable<unknown>
  return (
    candidate &&
    typeof candidate === 'object' &&
    candidate.subscribe &&
    typeof candidate.subscribe === 'function'
  )
}

export const tryCastListrInstance = <TContext>(
  object: unknown
): ListrInstance<TContext> | undefined => {
  const candidate = object as ListrInstance<TContext>
  if (
    typeof candidate === 'object' &&
    Boolean(candidate?.[IS_LISTR_INSTANCE])
  ) {
    return object as ListrInstance<TContext>
  }
}

export const isStream = (object: unknown): boolean =>
  isAStream(object) && !isObservable(object)
