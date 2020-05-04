export default class ListrError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'ListrError'
		this.errors = []
	}

	public errors: Error[]
}
