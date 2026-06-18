# Hydration and dehydration

Serialise and deserialise class instances across a network boundary. [`dehydrate()`](/util/hydrate/dehydrate) converts a value containing class instances into a plain JSON-safe structure; [`hydrate()`](/util/hydrate/hydrate) reconstructs the original instances on the other side using a shared [`Hydrations`](/util/hydrate/Hydrations) map.

**Things to know:**

- `Map`, `Set`, and `Date` are handled automatically without needing entries in `Hydrations`.
- Both functions recurse deeply into arrays and plain objects, but they do not guard against circular references.
- The `Hydrations` map keys are arbitrary string names — they must match between the server and client. Do not rely on class `.name` because minification changes it.
- Hydration is inherently unsafe: it reconstructs objects using `__proto__` assignment. Only hydrate data from trusted sources.

## Usage

### Defining a hydrations map

```ts
import { hydrate, dehydrate, type Hydrations } from "shelving/util";

class Money {
  constructor(readonly amount: number, readonly currency: string) {}
}

const HYDRATIONS: Hydrations = { Money };
```

### Dehydrating on the server

```ts
const serverValue = {
  price: new Money(9.99, "GBP"),
  tags: new Set(["sale", "new"]),
  createdAt: new Date("2024-01-01"),
};

const plain = dehydrate(serverValue, HYDRATIONS);
// {
//   price:     { $type: "Money",  $value: { amount: 9.99, currency: "GBP" } },
//   tags:      { $type: "Set",    $value: [["sale"], ["new"]] },
//   createdAt: { $type: "Date",   $value: 1704067200000 },
// }

const json = JSON.stringify(plain); // safe to send over the wire
```

### Hydrating on the client

```ts
const plain = JSON.parse(json);
const value = hydrate(plain, HYDRATIONS);
// value.price instanceof Money  → true
// value.tags instanceof Set     → true
// value.createdAt instanceof Date → true
```
