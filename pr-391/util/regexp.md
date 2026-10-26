# shelving/util/regexp

- Kind: module
- Import: `import { … } from "shelving/util/regexp";`

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


## Functions

- [isRegExp](regexp/isRegExp.md): Is an unknown value a RegExp instance?
- [assertRegExp](regexp/assertRegExp.md): Assert that an unknown value is a RegExp instance.
- [getRegExp](regexp/getRegExp.md): Convert a possible regular expression into a RegExp instance.
- [getRegExpSource](regexp/getRegExpSource.md): Convert a regular expression to its string source.
- [escapeRegExp](regexp/escapeRegExp.md): Escape special characters in a string regular expression.
- [createRegExpAny](regexp/createRegExpAny.md): Create a regular expression that matches any one of a list of other expressions.
- [createRegExpAll](regexp/createRegExpAll.md): Create a regular expression that matches all of a list of other expressions.
- [isMatch](regexp/isMatch.md): Does a string match against a regular expressions or string.
- [notMatch](regexp/notMatch.md): Does a string not match against a regular expressions or string.
- [allMatch](regexp/allMatch.md): All of the provided regular expressions match the string.
- [anyMatch](regexp/anyMatch.md): At least one of the provided regular expressions matches the string.
- [noneMatch](regexp/noneMatch.md): None of the provided regular expressions match the string.
- [getMatch](regexp/getMatch.md): Get an optional regular expression match, or undefined if no match could be made.
- [requireMatch](regexp/requireMatch.md): Get a required regular expression match, or throw ValueError if no match could be made.
- [getMatchGroups](regexp/getMatchGroups.md): Get the named groups of an optional regular expression match, or undefined if no match could be made.
- [requireMatchGroups](regexp/requireMatchGroups.md): Get the named groups of a required regular expression match, or throw ValueError if no match could be made.

## Interfaces

- [TypedRegExpExecArray](regexp/TypedRegExpExecArray.md): Regular expression match array whose full match is a specific string format.
- [TypedRegExp](regexp/TypedRegExp.md): Regular expression that matches a specific string format.
- [NamedRegExpExecArray](regexp/NamedRegExpExecArray.md): Regular expression match array that contains the specified named groups.
- [NamedRegExp](regexp/NamedRegExp.md): Regular expression that contains the specified named capture groups.

## Types

- [Matchable](regexp/Matchable.md): A thing that a string can be matched against.
- [Matchables](regexp/Matchables.md): A list of things that strings can be matched against.
- [PossibleRegExp](regexp/PossibleRegExp.md): Things that can be converted to a regular expression.
- [NamedRegExpData](regexp/NamedRegExpData.md): Set of named match groups from a regular expression.

## Constants

- [ALWAYS_REGEXP](regexp/ALWAYS_REGEXP.md): Regular expression that always matches everything.
- [NEVER_REGEXP](regexp/NEVER_REGEXP.md): Regular expression that never matches anything.
