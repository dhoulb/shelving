# isElement()

- Kind: function
- Import: `import { isElement } from "shelving/util/element";`

Is an unknown value an element?

## Signatures

```ts
isElement(value: unknown): value is Element
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is Element` | `true` if `value` is an `Element`, narrowing its type. |
