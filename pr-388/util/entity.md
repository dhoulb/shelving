# shelving/util/entity

- Kind: module
- Import: `import { … } from "shelving/util/entity";`

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


## Functions

- [getEntity](entity/getEntity.md): Split an optional entity tag like challenge:a1b2c3 into its type and id, or return EmptyEntity if the entity was invalid.
- [requireEntity](entity/requireEntity.md): Split an entity tag like challenge:a1b2c3 into its type and id, or throw RequiredError if the entity tag was invalid.

## Types

- [Entity](entity/Entity.md): Entity string combining a type and ID, e.g. challenge:a1b2c3
- [EntityType](entity/EntityType.md): Extract the type portion from an Entity string.
- [EmptyEntity](entity/EmptyEntity.md): Tuple representing an empty (invalid) entity, with undefined type and ID.

## Constants

- [EMPTY_ENTITY](entity/EMPTY_ENTITY.md): Shared EmptyEntity constant returned when an entity string is invalid.
