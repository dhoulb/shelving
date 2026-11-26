# shelving/util/vector

- Kind: module
- Import: `import { … } from "shelving/util/vector";`

Store and compare vectors of numbers, for example text embeddings for search. A `VectorArray` is a `Float32Array`.

- `getDotProduct()` scores two vectors. For two unit vectors (see `getUnitVector()`) the score is their cosine similarity: 1 is the same direction, 0 is unrelated.
- `mergeVectors()` joins several vectors and numbers into one. The dot product of two joined vectors is the sum of the dot products of their parts, so one comparison scores several things at once.
- `getWordVector()` makes a cheap vector from the words in a text, with no AI model. It matches words and parts of words, not meaning. Use it in tests and previews, or for name search.
- `getVectorArray()` reads a `Float32Array`, an array of numbers, or the object that `JSON.stringify()` makes of a `Float32Array`. So a vector stored as JSON reads back with no loss.

## Usage

### Score two texts

```ts
import { getDotProduct, getWordVector } from "shelving/util";

getDotProduct(getWordVector("cool dan"), getWordVector("cooldan94")); // About 0.4
getDotProduct(getWordVector("cool dan"), getWordVector("mudlarks")); // About 0
```

### Join meaning, words and a number

Scale each part to length 1 before the join. Put the weights in the query vector, not in the stored rows. Then you can change the weights with no rewrite of the rows.

```ts
import { getScaledVector, getUnitVector, getWordVector, mergeVectors } from "shelving/util";

// Stored row: each part has length 1.
const row = mergeVectors(getUnitVector(meaning), getWordVector(title), popularity);

// Query: the weights set the balance between the parts.
const query = mergeVectors(getScaledVector(queryMeaning, 0.7), getScaledVector(getWordVector(search), 0.3), 0.05);
```

### Find the nearest rows

Give a collection prop a `VECTOR()` schema, then query it with a `key~` prop. The rows with the highest dot product come first. A nearest query must have a `$limit`, and cannot have an `$order`.

```ts
import { Collection } from "shelving/db";
import { STRING, VECTOR } from "shelving/schema";

const SEARCH = new Collection("search", STRING, { type: STRING, vector: VECTOR(1026) });

const rows = await db.getQuery(SEARCH, { type: "challenge", "vector~": query, $limit: 20 });
```

- `MemoryDBProvider` sorts with `getDotProduct()`.
- `FirestoreProvider` sends a `findNearest` query with `DOT_PRODUCT` distance. Firestore needs a vector index on the prop (and on any equality filter you use with it).
- SQL providers store the vector as JSON, but throw for a nearest query.


## Functions

- [isVectorArray()](vector/isVectorArray.md): Is an unknown value a VectorArray (optionally with an exact size)?
- [assertVectorArray()](vector/assertVectorArray.md): Assert that an unknown value is a VectorArray (optionally with an exact size).
- [getVectorArray()](vector/getVectorArray.md): Get a VectorArray from a possible vector, or undefined if the value is not one.
- [requireVectorArray()](vector/requireVectorArray.md): Get a VectorArray from a possible vector, or throw if the value is not one.
- [getVectorLength()](vector/getVectorLength.md): Get the length (magnitude) of a vector.
- [getUnitVector()](vector/getUnitVector.md): Get a vector scaled to length 1, so the dot product of two unit vectors is their cosine similarity.
- [getScaledVector()](vector/getScaledVector.md): Get a vector with every number multiplied by a weight.
- [mergeVectors()](vector/mergeVectors.md): Join several vectors and single numbers into one longer vector, in order.
- [getDotProduct()](vector/getDotProduct.md): Get the dot product of two vectors: the sum of their numbers multiplied in pairs.
- [getWordVector()](vector/getWordVector.md): Get a cheap vector of the words in a text, with no AI model.

## Types

- [VectorArray](vector/VectorArray.md): A vector of numbers, for example a text embedding, stored as a Float32Array.
- [PossibleVectorArray](vector/PossibleVectorArray.md): A value that getVectorArray() can turn into a VectorArray.
