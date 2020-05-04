import SilentRenderer from 'listr-silent-renderer'
import VerboseRenderer from 'listr-verbose-renderer'
import DefaultRenderer from 'listr-update-renderer'
import { ListrOptions, RendererConstructor } from 'listr-core'

const isRendererSupported = <TContext>(
	renderer: RendererConstructor<TContext>
) => process.stdout.isTTY === true || renderer.nonTTY === true

const getRendererByKey = (key: string) => {
	switch (key) {
		case 'default':
			return DefaultRenderer
		case 'silent':
			return SilentRenderer
		case 'verbose':
			return VerboseRenderer
	}
}

const getRendererClass = <TContext>(
	renderer: ListrOptions<TContext>['renderer']
) => {
	if (typeof renderer === 'string') {
		return getRendererByKey(renderer) || DefaultRenderer
	}

	return typeof renderer === 'function' ? renderer : DefaultRenderer
}

export const getRenderer = <TContext>(
	renderer: ListrOptions<TContext>['renderer'],
	fallbackRenderer?: ListrOptions<TContext>['renderer']
) => {
	let returnValue = getRendererClass(renderer)

	if (!isRendererSupported(returnValue)) {
		returnValue = getRendererClass(fallbackRenderer)

		if (!returnValue || !isRendererSupported(returnValue)) {
			returnValue = VerboseRenderer
		}
	}

	return returnValue
}
