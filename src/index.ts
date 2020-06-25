export interface ResolveFunction<T> {
	(value: T): void;
}
export interface RejectFunction {
	(reason: Error): void;
}
export interface CallbackFunction<T> {
	(error?: Error, value?: T): void;
}

export interface Resolvable<T> {
	resolve: ResolveFunction<T>;
	reject: RejectFunction;
}

export interface Tagged<T = string> {
	tag?: T;
}
export interface Deferred<T, TT = string> extends Promise<T>, Resolvable<T>, Tagged<TT> {
	callback: CallbackFunction<T>;
	promise: Promise<T>;
}

export function defer<T, TT = string>(timeout?: number | Number, tag?: TT, keepalive?: boolean): Deferred<T, TT> {
	const futureResolvable: Partial<Resolvable<T>> = {};
	const promise = new Promise<T>((resolve, reject) => {
		futureResolvable.resolve = resolve;
		futureResolvable.reject = reject;
	}) as Partial<Deferred<T, TT>>;
	const resolvable: Resolvable<T> = futureResolvable as Resolvable<T>;

	if (timeout) {
		let timer: NodeJS.Timeout | null = setTimeout(() => {
			timer = null;
			const error = new Error('timeout');
			// @ts-ignore
			error.code = 'ETIMEDOUT';
			resolvable.reject(error);
		}, +timeout);
		const cancel = () => {
			timer = (timer && clearTimeout(timer)) || null;
		};
		if (!keepalive) timer.unref();
		resolvable.resolve = hookedResolve.bind(null, resolvable.resolve, cancel) as ResolveFunction<T>;
		resolvable.reject = hookedReject.bind(null, resolvable.reject, cancel);
	}

	promise.resolve = resolvable.resolve;
	promise.reject = resolvable.reject;
	promise.promise = promise as Promise<T>;
	promise.callback = resolvableCallback.bind(null, resolvable.resolve, resolvable.reject) as CallbackFunction<T>;
	promise.tag = tag;

	return promise as Deferred<T, TT>;
}

function resolvableCallback(resolve: ResolveFunction<any>, reject: RejectFunction, error?: Error, value?: any) {
	if (error) {
		reject(error);
	} else if (value) {
		resolve(value);
	} else {
		reject(new Error('invalid invocation'));
	}
}
function hookedResolve(resolve: ResolveFunction<any>, hook: () => void, value: any) {
	hook();
	resolve(value);
}
function hookedReject(reject: RejectFunction, hook: () => void, reason: Error) {
	hook();
	reject(reason);
}

export function sleep(ms: number | Number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, +ms);
	});
}

export interface Callable {
	(...args: any[]): void;
}
export interface FutureCallable<T> {
	(...args: any[]): Promise<T>;
}
export async function promise<T>(func: Callable, ...args: any[]): Promise<T> {
	const deferred = defer<T>();
	try {
		func(...args, deferred.callback);
	} catch (err) {
		deferred.reject(err);
	}
	return deferred;
}
export function promisify<T>(func: Callable): FutureCallable<T> {
	return (...args: any[]) => promise<T>(func, ...args);
}

interface CallableFuture<T> {
	(): T | Promise<T>;
}
type Future<T> = PromiseLike<T> | CallableFuture<T>;

export function timeout<T>(future: Future<T>, timeout: number | Number, keepalive: boolean = false): Promise<T> {
	const deferred = defer<T>(timeout, undefined, keepalive);
	if ('then' in future && 'function' === typeof future.then) {
		future.then(deferred.resolve, deferred.reject);
	} else {
		Promise.resolve()
			.then(() => (future as CallableFuture<T>)())
			.then(deferred.resolve, deferred.reject);
	}
	return deferred;
}
