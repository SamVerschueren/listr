import SimpleRenderer from './simple-renderer.js';

class TTYRenderer extends SimpleRenderer {
	static get nonTTY() {
		return false;
	}

	end() {
		console.log('tty done');
	}
}

export default TTYRenderer;
