# Vectors

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
