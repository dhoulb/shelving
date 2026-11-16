# formatObject()

- Kind: function
- Import: `import { formatObject } from "shelving/util/format";`

Format an unknown object as a string.
- Use the custom `.toString()` function if it exists (don't use built in `Object.prototype.toString` because it's useless.
- Use `.title` or `.name` or `.id` if they exist and are strings.
- Use `Object` otherwise.

## Signatures

```ts
formatObject(obj: ImmutableObject): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `obj` | `ImmutableObject` | Object to format. |

## Returns

| Type | Description |
| --- | --- |
| `string` | Best-available string representation of `obj`, or `"Object"` as a fallback. |
