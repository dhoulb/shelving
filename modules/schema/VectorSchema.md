# VectorSchema

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
