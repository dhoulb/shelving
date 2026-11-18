# assertRegExp()

- Kind: function
- Import: `import { assertRegExp } from "shelving/util/regexp";`

Assert that an unknown value is a `RegExp` instance.

## Signatures

```ts
assertRegExp(value: unknown): asserts value is RegExp
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to assert. |

## Returns

| Type | Description |
| --- | --- |
| `asserts value is RegExp` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` is not a `RegExp` instance. |
