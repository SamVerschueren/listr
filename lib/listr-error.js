class ListrError extends Error {
	constructor(message) {
		super(message);
		this.name = 'ListrError';
	}
}

export default ListrError;
