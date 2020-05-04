export interface ListrObserver<T> {
	next: (value: T) => void
	complete?: () => void
	error?: (error: Error) => void
}

export interface ListrObservable<T> {
	subscribe(observer: ListrObserver<T>): { unsubscribe: () => void }
}
