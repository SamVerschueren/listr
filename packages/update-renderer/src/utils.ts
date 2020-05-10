/* eslint-disable import/default */
import chalk from 'chalk'
import logSymbols from 'log-symbols'
import figures from 'figures'
import elegantSpinner from 'elegant-spinner'
import { Task, ListrOptions } from 'listr-core'

const pointer = chalk.yellow(figures.pointer)
const skipped = chalk.yellow(figures.arrowDown)

export const isDefined = (x: unknown) => x !== null && x !== undefined

export const getSymbol = <TContext>(
  task: Task<TContext>,
  options: ListrOptions<TContext>
) => {
  if (!task.spinner) {
    task.spinner = elegantSpinner()
  }

  if (task.isPending()) {
    return options.showSubtasks !== false && task.subtasks.length > 0
      ? pointer
      : chalk.yellow(task.spinner())
  }

  if (task.isCompleted()) {
    return logSymbols.success
  }

  if (task.hasFailed()) {
    return task.subtasks.length > 0 ? pointer : logSymbols.error
  }

  if (task.isSkipped()) {
    return skipped
  }

  return ' '
}
