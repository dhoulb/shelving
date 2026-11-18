# isIterable()

- Kind: function
- Import: `import { isIterable } from "shelving/util/iterate";`

Is an unknown value an iterable?

## Signatures

```ts
isIterable(value: unknown): value is Iterable<unknown>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is Iterable<unknown>` | `true` if `value` is an object with a `Symbol.iterator` method, otherwise `false`. |
