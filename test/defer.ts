import { describe, it, before } from '@xutl/test';
import assert from 'assert';

import { defer, Deferred, sleep } from '../';

describe('defer', () => {
	let deferred: Deferred<number>;

	it('defer is a function', () => assert.equal(typeof defer, 'function'));
	it('deferred is a Promise', () => {
		deferred = defer<number>();
		assert(deferred instanceof Promise);
	});
	it('deferred.resolve is a function', () => assert.equal(typeof deferred.resolve, 'function'));
	it('deferred.reject is a function', () => assert.equal(typeof deferred.reject, 'function'));
	it('deferred.promise is an object', () => assert.equal(typeof deferred.promise, 'object'));
	it('deferred.promise is a Promise', () => assert(deferred.promise instanceof Promise));
	it('deferred is resolved when calling deferred.resolve()', async () => {
		const expected = Math.random();
		deferred.resolve(expected);
		const actual = await deferred;
		assert.equal(actual, expected);
	});
	it('deferred is rejected when calling deferred.reject()', async () => {
		deferred = defer<number>();
		const expected = new Error('rejected');
		deferred.reject(expected);
		try {
			await deferred;
			assert(false);
		} catch (err) {
			assert.strictEqual(err, expected);
		}
	});
	it('deferred is resolved when calling deferred.callback()', async () => {
		const deferred = defer<number>();
		const expected = Math.random();
		const callback = deferred.callback;
		callback(undefined, expected);
		const actual = await deferred;
		assert.equal(actual, expected);
	});
	it('deferred is rejected when calling deferred.callback()', async () => {
		const deferred = defer<number>();
		const expected = new Error('rejected');
		const callback = deferred.callback;
		callback(expected);
		try {
			await deferred;
			assert(false);
		} catch (actual) {
			assert.equal(actual, expected);
		}
	});
	it('deferred can timeout', async () => {
		const deferred = defer<number>(50);
		//setTimeout(() => deferred.resolve(Math.random()), 1000);
		try {
			await deferred;
			assert(false);
		} catch (error) {
			if (!isErrorCode(error)) throw error;
			assert.equal(error.code, 'ETIMEDOUT');
		}
	});
	it('deferred with timout can resolve without timeout', async () => {
		const deferred = defer<number>(50);
		const backup = defer<number>();
		process.on('uncaughtException', backup.callback);
		process.on('unhandledRejection', backup.callback);
		deferred.resolve(1);
		await deferred;
		await sleep(100);
		backup.resolve(2);
		assert.equal(await backup, 2);
	});
});

function isErrorCode(e: any): e is Error & { code: string } {
	if (!e || !(e as Error).message || !(e as { code: string }).code) return false;
	return true;
}
