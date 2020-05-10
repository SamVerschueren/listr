import { BaseRenderer, DefaultContext, Task } from 'listr-core'

const renderHelper = (task, event) => {
  if (event.type === 'STATE') {
    const state = task.isPending() ? 'started' : task.state
    console.log(`${task.title} [${state}]`)

    if (task.isSkipped() && task.output) {
      console.log(`> ${task.output}`)
    }
  } else if (event.type === 'DATA') {
    console.log(`> ${event.data}`)
  } else if (event.type === 'TITLE') {
    console.log(`${task.title} [title changed]`)
  }
}

const render = <TContext>(tasks: Task<TContext>[]) => {
  for (const task of tasks) {
    task.subscribe({
      next: (event) => {
        if (event.type === 'SUBTASKS') {
          render(task.subtasks)
          return
        }

        renderHelper(task, event)
      },
    })
  }
}

export default class SimpleRenderer<
  TContext = DefaultContext
> extends BaseRenderer<TContext> {
  static get nonTTY() {
    return true
  }

  render() {
    render(this.tasks)
  }

  end() {
    console.log('done')
  }
}
