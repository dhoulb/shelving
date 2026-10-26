# pickProps()

- Kind: function
- Import: `import { pickProps } from "shelving/util/object";`

Pick several props from an object and return a new object with only those props.

## Signatures

```ts
pickProps(obj: T, ...keys: K[]): Pick<T, K>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `obj` | `T` | The object to pick the props from. |
| `keys` | `K[]` | The keys of the props to pick. |

## Returns

| Type | Description |
| --- | --- |
| `Pick<T, K>` | A new object containing only the picked props. |
