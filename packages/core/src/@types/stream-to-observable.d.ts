declare module '@samverschueren/stream-to-observable' {
	import { Stream } from 'stream'

	export interface StreamToObservable {
		<TObservable>(stream: Stream): TObservable
	}

	const fn: StreamToObservable

	export default fn
}
