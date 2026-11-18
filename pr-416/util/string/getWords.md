# getWords()

- Kind: function
- Import: `import { getWords } from "shelving/util/string";`

Return an array of the separate words and "quoted phrases" found in a string.
- Phrases enclosed "in quotes" are a single word.
- Performs no processing on the words, so control chars, punctuation, symbols, and case are all preserved.

Note: this splits words based on spaces, so won't work well with logographic writing systems e.g. kanji.

## Signatures

```ts
getWords(str: string): ImmutableArray<string>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | The string to extract words from. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<string>` | Array of the separate words and quoted phrases found in `str`. |
