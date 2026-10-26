# shelving/util/string

- Kind: module
- Import: `import { … } from "shelving/util/string";`

Core helpers for checking, converting, sanitising, and transforming strings. Used throughout Shelving wherever user input is cleaned or URLs are generated.

**Things to know:**

- `getString()` converts `boolean`, `number`, `Date`, and arrays to strings but returns `undefined` for anything else (e.g. objects, `null`). Use `requireString()` to throw instead.
- `sanitizeText()` is for single-line input (titles, labels). `sanitizeMultilineText()` is for longer content — it preserves `\n` but normalises everything else.
- `simplifyString()` uses Unicode normalisation (`NFKD`) so accented, ligature, and styled characters (`é`, `ﬀ`, `Ⓒ`, `𝐶`) collapse to plain letters before stripping. A small map also converts styled letters that `NFKD` misses (`ᴄ`, `🅒`, `🅲`). Letters from other scripts (`ж`, `π`) are kept. Marks like `©` and `™` are removed, but units and abbreviations keep their letters (`㎏` becomes `kg`). This makes it reliable for search and slug generation, e.g. `getSlug("𝓒𝓸𝓸𝓵 𝓣𝓲𝓽𝓵𝓮")` returns `"cool-title"`.
- `splitString()` differs from `String.prototype.split()` in that excess segments are concatenated onto the last segment rather than discarded, and it enforces min/max segment counts.
- `getWords()` honours quoted phrases: `"hello world"` is one word, not two.

## Usage

### Type checking and conversion

```ts
import { isString, getString, requireString } from "shelving/util";

isString("hi");       // true
isString(42);         // false

getString(42);         // "42"
getString(true);       // "true"
getString(new Date()); // ISO string e.g. "2024-01-15T00:00:00.000Z"
getString({});         // undefined
```

### Length checks

```ts
import { isStringLength, assertStringLength } from "shelving/util";

isStringLength("hello", 1, 10); // true
isStringLength("", 1);          // false
```

### Sanitising user input

```ts
import { sanitizeText, sanitizeMultilineText } from "shelving/util";

sanitizeText("  Hello\x00  World  ");  // "Hello World"
sanitizeMultilineText("line1\r\nline2\n\n\nline3"); // "line1\nline2\n\nline3"
```

### Slugs and refs

```ts
import { simplifyString, getSlug, requireSlug, getRef } from "shelving/util";

simplifyString("Héllo Wörld! 😂"); // "hello world"
getSlug("Hello World!");           // "hello-world"
getSlug("!!!");                    // undefined (empty after simplification)
requireSlug("!!!");                // throws RequiredError
getRef("Hello World");             // "helloworld" (no separator)
```

### Word splitting and limiting

```ts
import { getWords, limitString, splitString, getFirstLine } from "shelving/util";

getWords(`hello "world foo" bar`);  // ["hello", "world foo", "bar"]
limitString("A long string here", 10); // "A long…"
splitString("a/b/c", "/", 2);         // ["a", "b/c"]  — excess joins last segment
getFirstLine("line one\nline two");    // "line one"
```

### Joining

```ts
import { joinStrings } from "shelving/util";

joinStrings(["a", "b", "c"], ", "); // "a, b, c"
```


## Functions

- [isString](string/isString.md): Is an unknown value a string?
- [assertString](string/assertString.md): Assert that a value is a string.
- [getString](string/getString.md): Convert an unknown value to a string, or return undefined if conversion fails.
- [requireString](string/requireString.md): Convert a possible string to a string, or throw RequiredError if conversion fails.
- [isStringLength](string/isStringLength.md): Is a value a string with a length between min and max?
- [assertStringLength](string/assertStringLength.md): Assert that a value is a string with a length between min and max.
- [requireStringLength](string/requireStringLength.md): Convert a possible string to a string with min/max length, or throw RequiredError if conversion fails.
- [isStringBetween](string/isStringBetween.md): Does a string have a length between min and max?
- [joinStrings](string/joinStrings.md): Concatenate an iterable set of strings together.
- [sanitizeText](string/sanitizeText.md): Sanitize a single line of text.
- [sanitizeWord](string/sanitizeWord.md): Sanitize a single word of text.
- [sanitizeMultilineText](string/sanitizeMultilineText.md): Sanitize multiple lines of text.
- [simplifyString](string/simplifyString.md): Simplify a string by removing anything that isn't a number, letter, or space.
- [getSlug](string/getSlug.md): Convert a string to a kebab-case URL slug, or return undefined if conversion resulted in an empty ref.
- [requireSlug](string/requireSlug.md): Convert a string to a kebab-case URL slug, or throw RequiredError if conversion resulted in an empty ref.
- [getRef](string/getRef.md): Convert a string to a unique ref e.g. abc123, or return undefined if conversion resulted in an empty string.
- [requireRef](string/requireRef.md): Convert a string to a unique ref e.g. abc123, or throw RequiredError if conversion resulted in an empty string.
- [getWords](string/getWords.md): Return an array of the separate words and "quoted phrases" found in a string.
- [getFirstLine](string/getFirstLine.md): Get the (trimmed) first full line of a string.
- [isUppercaseLetter](string/isUppercaseLetter.md): Is the first character of a string an uppercase letter?
- [isLowercaseLetter](string/isLowercaseLetter.md): Is the first character of a string a lowercase letter?
- [limitString](string/limitString.md): Limit a string to a given length.
- [splitString](string/splitString.md): Divide a string into parts based on a separator.
- [trimString](string/trimString.md): Trim a string (as a function, so it can be used in mapping).
- [isNonEmptyString](string/isNonEmptyString.md): Does a string have length?

## Types

- [NotString](string/NotString.md): Type that never matches the string type.
- [PossibleString](string/PossibleString.md): Things that can be reliably converted to a string with no confusion.
- [Segments](string/Segments.md): Series of string segments with at least one segment (this is what you actually get back when you split a string).
