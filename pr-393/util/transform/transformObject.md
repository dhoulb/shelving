# transformObject()

- Kind: function
- Import: `import { transformObject } from "shelving/util/transform";`

Transform an object using a set of named transforms.
- Each transform is keyed by prop name and applied to that prop's current value.
- Props with no transform are left untouched; the original object is returned unchanged if no transform alters a value.

## Signatures

```ts
transformObject(obj: T, transforms: Transforms<T, T | Partial<T>, A>, ...args: A): T
transformObject(obj: T | Partial<T>, transforms: Transforms<T, T | Partial<T>, A>, ...args: A): Partial<T>
transformObject(obj: I, transforms: Transforms<I, O | Partial<O>, A>, ...args: A): O
transformObject(obj: I | Partial<I>, transforms: Transforms<I, O | Partial<O>, A>, ...args: A): Partial<O>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `obj` | `T` | The source object to transform. |
| `transforms` | `Transforms<T, T \| Partial<T>, A>` | Object of per-prop transform functions, keyed by prop name. |
| `args` | `A` | Additional arguments passed through to each transform. |
| `obj` | `T \| Partial<T>` |  |
| `transforms` | `Transforms<T, T \| Partial<T>, A>` |  |
| `args` | `A` |  |
| `obj` | `I` |  |
| `transforms` | `Transforms<I, O \| Partial<O>, A>` |  |
| `obj` | `I \| Partial<I>` |  |

## Returns

| Type | Description |
| --- | --- |
| `T` | Transformed object (or same object if no changes were made). |
| `Partial<T>` |  |
| `O` |  |
| `Partial<O>` |  |
