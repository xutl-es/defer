import { describe, it, before } from '@xutl/test';
import assert from 'assert';

import { defer, Deferred } from '../';

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
			assert.equal(error.code, 'ETIMEDOUT');
		}
	});
});
