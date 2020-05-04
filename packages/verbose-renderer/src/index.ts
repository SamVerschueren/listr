import { arrowRight } from 'figures'
import { hide, show } from 'cli-cursor'
import {
	Task,
	ListrEvent,
	ListrOptions,
	BaseRenderer,
	DefaultContext,
} from 'listr-core'

import { log as logUtil } from './utils'

const renderHelper = <TContext>(
	task: Task<TContext>,
	event: ListrEvent,
	options: ListrOptions<TContext>
) => {
	const log = (msg: string) => logUtil<TContext>(options, msg)

	if (event.type === 'STATE') {
		const message = task.isPending() ? 'started' : task.state

		log(`${task.title} [${message}]`)

		if (task.isSkipped() && task.output) {
			log(`${arrowRight} ${task.output}`)
		}
	} else if (event.type === 'DATA') {
		log(`${arrowRight} ${event.data}`)
	} else if (event.type === 'TITLE') {
		log(`${task.title} [title changed]`)
	}
}

const render = <TContext>(
	tasks: Task<TContext>[],
	options: ListrOptions<TContext>
) => {
	for (const task of tasks) {
		task.subscribe({
			next: (event) => {
				if (event.type === 'SUBTASKS') {
					render(task.subtasks, options)
					return
				}

				renderHelper(task, event, options)
			},
			error: (err) => {
				console.log(err)
			},
		})
	}
}

export default class VerboseRenderer<
	TContext = DefaultContext
> extends BaseRenderer<TContext> {
	constructor(tasks: Task<TContext>[], options: ListrOptions<TContext>) {
		super(tasks, options)
		this.options = Object.assign(
			{
				dateFormat: 'HH:mm:ss',
			},
			options
		)
	}

	static get nonTTY() {
		return true
	}

	render() {
		hide()
		render(this.tasks, this.options)
	}

	end() {
		show()
	}
}
