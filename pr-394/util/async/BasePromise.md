# BasePromise

- Kind: class
- Import: `import { BasePromise } from "shelving/util/async";`
- Extends: `Promise<T>`

`Promise` designed for extending with `._resolve()` and `._reject()` methods that can be accessed by subclasses.

## Signatures

```ts
new BasePromise<T>()
```

## Returns

| Type | Description |
| --- | --- |
| `BasePromise<T>` |  |

## Examples

```ts
class MyPromise extends BasePromise<number> {
	done() { this._resolve(123); }
}
```
