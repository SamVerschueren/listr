import process from 'node:process';
import silent from 'listr-silent-renderer';
import verbose from 'listr-verbose-renderer';
import main from 'listr-update-renderer';

const renderers = {
	silent,
	verbose,
	main,
};

const isRendererSupported = renderer => process.stdout.isTTY === true || renderer.nonTTY === true;

const getRendererClass = renderer => {
	if (typeof renderer === 'string') {
		return renderers[renderer] || renderers.main;
	}

	return typeof renderer === 'function' ? renderer : renderers.main;
};

export const getRenderer = (renderer, fallbackRenderer) => {
	let returnValue = getRendererClass(renderer);

	if (!isRendererSupported(returnValue)) {
		returnValue = getRendererClass(fallbackRenderer);

		if (!returnValue || !isRendererSupported(returnValue)) {
			returnValue = renderers.verbose;
		}
	}

	return returnValue;
};
