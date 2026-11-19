# omitProp

- Kind: constant
- Import: `import { omitProp } from "shelving/util/object";`

Remove a prop from an object (immutably) and return a new object without that prop.
- If the key doesn't exist the original object is returned unchanged.

## Signatures

```ts
omitProp: <T, K extends Key<T>>(input: T, key: K) => Omit<T, K>
```

## Returns

| Type | Description |
| --- | --- |
| `unknown` | A new object without the removed prop, or the original object if the key was not present. |
