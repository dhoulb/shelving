# TypeScript type utilities

Advanced TypeScript utility types used internally across Shelving. Import these when you need to manipulate generic type algebra in your own code.

## Types

### `UnionToIntersection<U>`

Converts a union type into an intersection type.

```ts
import type { UnionToIntersection } from "shelving/util";

type A = { a: string };
type B = { b: number };
type AB = UnionToIntersection<A | B>; // { a: string } & { b: number }
```

### `Resolve<T>`

Flattens an intersection of object types into a single readable object type. Useful for making hover tooltips and error messages readable.

```ts
import type { Resolve } from "shelving/util";

type Merged = Resolve<{ a: string } & { b: number }>;
// { a: string; b: number }
```

## See also

- [util](/util) — Overview of all util helpers.
