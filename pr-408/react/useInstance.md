# useInstance()

- Kind: function
- Import: `import { useInstance } from "shelving/react";`

Use a memoised class instance.
- Creates a new instance of `Constructor` using `args`
- Returns same instance for as long as `args` is equal to previous `args`.

Create a stable class instance inside a component. A new instance is constructed only when the constructor arguments change (by deep equality of the argument list), so the instance is safe to depend on across renders.

This is useful for creating stores, caches, or other objects that should live for the lifetime of a component without being hoisted to module scope — for example when the object depends on props.

## Usage

```tsx
import { useInstance } from "shelving/react";
import { APICache } from "shelving/api";

function MyComponent({ provider }: { provider: APIProvider }) {
  const cache = useInstance(APICache, provider); // Stable across renders.
  // ...rebuilt only when `provider` changes.
}
```

Arguments are compared by deep equality, so passing equal-but-not-identical values (a fresh object literal each render) does not trigger reconstruction.


## Signatures

```ts
useInstance(Constructor: new (...a: A) => T, ...args: A): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `Constructor` | `new (...a: A) => T` | Class to instantiate with `args`. |
| `args` | `A` | Constructor arguments — a change in `args` constructs a fresh instance. |

## Returns

| Type | Description |
| --- | --- |
| `T` |  |
