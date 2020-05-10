/* eslint-disable import/default */
'use strict'
import logUpdate from 'log-update'
import chalk from 'chalk'
import figures from 'figures'
import indentString from 'indent-string'
import cliTruncate from 'cli-truncate'
import stripAnsi from 'strip-ansi'
import { Task, ListrOptions, BaseRenderer, DefaultContext } from 'listr-core'

import { getSymbol, isDefined } from './utils'

const renderHelper = <TContext>(
  tasks: Task<TContext>[],
  options: ListrOptions<TContext>,
  level = 0
): string => {
  let output: string[] = []

  for (const task of tasks) {
    if (task.isEnabled) {
      const skipped = task.isSkipped() ? ` ${chalk.dim('[skipped]')}` : ''

      output.push(
        indentString(
          ` ${getSymbol(task, options)} ${task.title}${skipped}`,
          level
        )
      )

      if (
        (task.isPending() || task.isSkipped() || task.hasFailed()) &&
        isDefined(task.output)
      ) {
        let data = task.output

        if (data && typeof data === 'string') {
          data = data.trim().split('\n').filter(Boolean).pop()

          if (data) {
            data = stripAnsi(data)
          }

          if (data === '') {
            data = undefined
          }
        }

        if (isDefined(data)) {
          const out = indentString(`${figures.arrowRight} ${data}`, level)
          output.push(
            `   ${chalk.gray(cliTruncate(out, process.stdout.columns - 3))}`
          )
        }
      }

      if (
        (task.isPending() || task.hasFailed() || options.collapse === false) &&
        (task.hasFailed() || options.showSubtasks !== false) &&
        task.subtasks.length > 0
      ) {
        output = output.concat(renderHelper(task.subtasks, options, level + 1))
      }
    }
  }

  return output.join('\n')
}

const render = <TContext>(
  tasks: Task<TContext>[],
  options: ListrOptions<TContext>
) => {
  logUpdate(renderHelper(tasks, options))
}

export default class UpdateRenderer<
  TContext = DefaultContext
> extends BaseRenderer<TContext> {
  constructor(tasks: Task<TContext>[], options: ListrOptions<TContext>) {
    super(tasks, options)
    this.options = Object.assign(
      {
        showSubtasks: true,
        collapse: true,
        clearOutput: false,
      },
      options
    )
    this.id = undefined
  }

  render() {
    if (this.id) {
      // Do not render if we are already rendering
      return
    }

    this.id = setInterval(() => {
      render(this.tasks, this.options)
    }, 100)
  }

  end(error: Error) {
    if (this.id) {
      clearInterval(this.id)
      this.id = undefined
    }

    render(this.tasks, this.options)

    if (this.options.clearOutput && error === undefined) {
      logUpdate.clear()
    } else {
      logUpdate.done()
    }
  }

  protected id: NodeJS.Timeout | undefined
}
