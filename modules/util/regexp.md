# Regular expression helpers

Typed wrappers and combinators for working with regular expressions. They let you test, escape, compose, and extract matches with cleaner types than the raw `RegExp` API.

**Things to know:**

- `Matchable` is `string | RegExp`. When a `string` is used as a `Matchable`, matching uses `===` equality rather than `RegExp.test()`.
- `createRegExpAny([])` returns `NEVER_REGEXP` (matches nothing); `createRegExpAll([])` returns `ALWAYS_REGEXP` (matches everything) — consistent with "any of nothing" vs "all of nothing" semantics.
- `NamedRegExp<T>` and `TypedRegExp<T>` are typed interfaces that carry capture group shapes through to `exec()` return values, avoiding manual casting.
- `getMatch()` returns `undefined` instead of `null` on no-match, fitting the rest of the util `get*` convention.

## Usage

### Testing strings

```ts
import { isMatch, notMatch, allMatch, anyMatch, noneMatch } from "shelving/util";

isMatch("hello", /^hell/);    // true
isMatch("hello", "hello");    // true  (string Matchable = exact equality)
notMatch("world", /^hell/);   // true

allMatch("hello world", /hello/, /world/);  // true
anyMatch("hello", /foo/, /hell/);           // true
noneMatch("hello", /foo/, /bar/);           // true
```

### Building and escaping regexps

```ts
import { getRegExp, getRegExpSource, escapeRegExp, createRegExpAny, createRegExpAll } from "shelving/util";

getRegExp("\\d+", "g");         // /\d+/g
getRegExpSource(/\d+/);         // "\\d+"
escapeRegExp("1 + 1 = 2");      // "1 \\+ 1 \\= 2"

createRegExpAny([/foo/, /bar/]); // /(?:foo)|(?:bar)/
createRegExpAll([/foo/, /bar/]); // /^(?=.*?(?:foo))(?=.*?(?:bar))/
```

### Extracting matches

```ts
import { getMatch, requireMatch, getMatchGroups, requireMatchGroups } from "shelving/util";

const DATE_RE = /(?<year>\d{4})-(?<month>\d{2})/;

getMatch("2024-03", DATE_RE);         // RegExpExecArray | undefined
getMatchGroups("2024-03", DATE_RE);   // { year: "2024", month: "03" } | undefined

requireMatch("no-date", DATE_RE);         // throws ValueError
requireMatchGroups("no-date", DATE_RE);   // throws ValueError
```

### Type guards

```ts
import { isRegExp, assertRegExp } from "shelving/util";

isRegExp(/foo/);      // true
isRegExp("foo");      // false
assertRegExp("foo");  // throws RequiredError
```
