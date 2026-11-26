# VectorSchema

- Kind: class
- Import: `import { VectorSchema } from "shelving/schema";`
- Extends: `Schema<VectorArray>`

Schema that defines a valid vector of numbers (a `VectorArray`), for example a text embedding.

- Coerces with `getVectorArray()`: a `Float32Array`, an array of finite numbers, or the object that `JSON.stringify()` makes of a `Float32Array`.
- The vector must have exactly `size` numbers.
- It does not scale the vector: a joined vector (see `mergeVectors()`) is not length 1 on purpose.

Validates a value into a `VectorArray` (a `Float32Array`) with an exact number of numbers, for example a text embedding. It accepts a `Float32Array`, an array of finite numbers, or the object that `JSON.stringify()` makes of a `Float32Array`. Other values, and vectors of the wrong size, throw. A missing value falls back to a vector of zeros.

It does not scale the vector to length 1, because a joined vector (see `mergeVectors()`) is not length 1 on purpose.

`VECTOR()` is the sugar factory.

## Usage

```ts
import { VECTOR } from "shelving/schema";

const EMBEDDING = VECTOR(3);

EMBEDDING.validate([0.5, -0.5, 0]); // Float32Array [0.5, -0.5, 0]
EMBEDDING.validate({ "0": 0.5, "1": -0.5, "2": 0 }); // Float32Array [0.5, -0.5, 0]  (JSON form)
EMBEDDING.validate([1, 2]); // Throws "Must be vector with 3 numbers"
EMBEDDING.validate(undefined); // Float32Array [0, 0, 0]  (default)
```

### Nearest queries

A collection prop with a `VectorSchema` can be queried with a `key~` prop. See `shelving/util/vector` for an example.


## Signatures

```ts
new VectorSchema({ size, value = new Float32Array(size), ...options }: VectorSchemaOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `VectorSchemaOptions` |  |
| `.size` | `number` | The exact number of numbers in the vector. Read only. |
| `.value` | `VectorArray \| undefined` | Default vector used when the input is `undefined`. Read only. Defaults to `` A vector of `size` zeros ``. |

## Returns

| Type | Description |
| --- | --- |
| `VectorSchema` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `size` | `number` | Read only. |

## Methods

- [VectorSchema.validate()](VectorSchema/validate.md): Validate an unknown value and coerce it to a vector.
