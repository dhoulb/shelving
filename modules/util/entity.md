# Entity string helpers

An **entity** is a compact `"type:id"` string that encodes both the kind of resource and its identifier in one value, e.g. `"challenge:a1b2c3"`. These helpers parse and validate those strings so callers never need to split on `:` themselves.

## Usage

### Splitting an entity string

```ts
import { getEntity, requireEntity, EMPTY_ENTITY } from "shelving/util";

getEntity("challenge:a1b2c3");  // ["challenge", "a1b2c3"]
getEntity(null);                // [undefined, undefined]  (EMPTY_ENTITY)
getEntity("bad-value");         // [undefined, undefined]  (EMPTY_ENTITY)

requireEntity("challenge:a1b2c3"); // ["challenge", "a1b2c3"]
requireEntity("bad-value");        // throws RequiredError
```

### Using the `Entity<T>` type

```ts
import type { Entity, EntityType } from "shelving/util";

type ChallengeEntity = Entity<"challenge">; // "challenge:${string}"

function handleEntity(e: ChallengeEntity) {
  const [type, id] = requireEntity(e);
  // type is narrowed to "challenge"
}
```

## See also

- [util](/util) — full util module overview.
- [error](/error) — [`RequiredError`](/error/RequiredError) thrown by [`requireEntity()`](/util/entity/requireEntity).
