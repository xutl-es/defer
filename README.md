# @xutl/defer

One [eXtremely Useful Tool Library](https://xutl.es) to facilitate using the defer pattern, which makes working with promises much easier for certain circumstances.

## Install

```bash
npm install --save-dev @xutl/defer
```

## Usage

```typescript
import { defer, sleep, timeout } from '@xutl/defer';

// sleep
await sleep(1000); // sleeps 1 second

// defer
const deferred = defer<string>();
stream.once('data', (item) => deferred.resolve(`${item}`));
await deferred;

// timeout
await timeout<string>(getStringPromise(), 1000); // waits 1 second for promise to resolve. otherwise rejects with timeout error
```

## API

- `function defer<T, TT = string>(timeout?: number | Number, tag?: TT): Deferred<T, TT>`
- `function sleep(ms: number | Number): Promise<void>`
- `function timeout<T>(future: Future<T>, timeout: number | Number): Promise<T>`
- `function promise<T>(func: Callable, ...args: any[]): Promise<T>`
- `function promisify<T>(func: Callable): FutureCallable<T>`

## License

Copyright 2019,2020 xutl.es

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
