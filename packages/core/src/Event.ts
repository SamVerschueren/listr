export type ListrEventType = 'STATE' | 'DATA' | 'SUBTASKS' | 'TITLE' | 'ENABLED'

export interface ListrEvent {
  type: ListrEventType
  data?: string | boolean
}
