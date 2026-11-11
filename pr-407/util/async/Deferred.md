# Deferred

- Kind: type
- Import: `import { Deferred } from "shelving/util/async";`

Deferred allows you to access the internal resolve/reject callbacks of a `Promise`.

## Signatures

```ts
{
	promise: Promise<T>;
	resolve: ValueCallback<T>;
	reject: ErrorCallback;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `promise` | `Promise<T>` |  |
| `resolve` | `ValueCallback<T>` |  |
| `reject` | `ErrorCallback` |  |

## Types

- `Promise`
- [ValueCallback](../function/ValueCallback.md): A callback is a function that is called when something happens with a value.
- [ErrorCallback](../function/ErrorCallback.md): Function that is called when something errors.
