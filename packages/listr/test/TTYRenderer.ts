import { DefaultContext } from 'listr-core'

import SimpleRenderer from './SimpleRenderer'

export default class TTYRenderer<
	TContext = DefaultContext
> extends SimpleRenderer<TContext> {
	static get nonTTY() {
		return false
	}

	end() {
		console.log('tty done')
	}
}
