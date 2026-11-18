# createDeferred()

- Kind: function
- Import: `import { createDeferred } from "shelving/util/async";`

Create a deferred to access the `resolve()` and `reject()` functions of a promise.
- See https://github.com/tc39/proposal-promise-with-resolvers/

## Signatures

```ts
createDeferred(): Deferred<T>
```

## Returns

| Type | Description |
| --- | --- |
| `Deferred<T>` | A `Deferred` exposing the promise and its `resolve()`/`reject()` functions. |
