# getWordVector()

- Kind: function
- Import: `import { getWordVector } from "shelving/util/vector";`

Get a cheap vector of the words in a text, with no AI model.
- Simplifies the text (see `simplifyString()`), then hashes each word, and each three-letter piece of each word, into one of `size` slots, and scales the result to length 1.
- So texts that share words, or parts of words, get similar vectors: `cool dan` is close to `cooldan94`, and `runn` is close to `running`.
- It does not know meaning: `hills` is not close to `incline`. Use an embedding model when meaning matters.
- The same text and size always give the same vector.

## Signatures

```ts
getWordVector(text: string, size = 256): VectorArray
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `text` | `string` | The text to turn into a vector. |
| `size` | `unknown` | The number of slots. Fewer slots means more unrelated pieces share a slot. Defaults to `256`. |

## Returns

| Type | Description |
| --- | --- |
| `VectorArray` | A unit vector, or all zeros for a text with no letters or numbers. |

## Examples

```ts
getDotProduct(getWordVector("cool dan"), getWordVector("cooldan94")) // About 0.4
```
