import chalk from 'chalk'
import format from 'date-fns/format'
import { ListrOptions } from 'listr-core'

export const log = <TContext>(
	options: ListrOptions<TContext>,
	output: string
) => {
	if (!options.dateFormat) {
		console.log(output)
		return
	}

	const timestamp = format(new Date(), options.dateFormat)

	console.log(chalk.dim(`[${timestamp}]`) + ` ${output}`)
}
