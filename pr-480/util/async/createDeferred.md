# createDeferred()

- Kind: function
- Import: `import { createDeferred } from "shelving/util/async";`

Create a deferred to access the `resolve()` and `reject()` functions of a promise.
- Uses native `Promise.withResolvers()` where it exists, and a `new Promise()` executor where it does not.
- See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers

## Signatures

```ts
createDeferred(): Deferred<T>
```

## Returns

| Type | Description |
| --- | --- |
| `Deferred<T>` | A `Deferred` exposing the promise and its `resolve()`/`reject()` functions. |
