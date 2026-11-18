# omitProps()

- Kind: function
- Import: `import { omitProps } from "shelving/util/object";`

Remove several props from an object (immutably) and return a new object without those props.
- If none of the keys exist the original object is returned unchanged.

## Signatures

```ts
omitProps(input: T, ...keys: K[]): Omit<T, K>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `input` | `T` | The object to remove the props from. |
| `keys` | `K[]` | The keys of the props to remove. |

## Returns

| Type | Description |
| --- | --- |
| `Omit<T, K>` | A new object without the removed props, or the original object if no keys were present. |
