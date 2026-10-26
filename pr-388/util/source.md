# shelving/util/source

- Kind: module
- Import: `import { … } from "shelving/util/source";`

Two helpers for traversing a chain of `Sourceable` objects — objects with a `.source` property — and returning the first instance of a given class. Used to unwrap layered or decorated objects back to their underlying implementation.

**Things to know:**

- Traversal follows `.source` links recursively until it finds an instance of the requested class, or runs out of links.
- `getSource()` returns `undefined` when no matching instance is found; `requireSource()` throws `RequiredError`.
- Any object can participate by implementing the `Sourceable<T>` interface (`readonly source: T`).

## Usage

```ts
import { getSource, requireSource } from "shelving/util";
import type { Sourceable } from "shelving/util";

class Database { query() { /* ... */ } }

class CachedDatabase implements Sourceable<Database> {
  constructor(readonly source: Database) {}
}

class LoggedDatabase implements Sourceable<CachedDatabase> {
  constructor(readonly source: CachedDatabase) {}
}

const db = new LoggedDatabase(new CachedDatabase(new Database()));

getSource(Database, db);      // the inner Database instance
getSource(CachedDatabase, db); // the CachedDatabase instance
getSource(Database, {});       // undefined  (no .source chain)

requireSource(Database, db);       // the inner Database instance
requireSource(Database, "oops");   // throws RequiredError
```


## Functions

- [getSource](source/getSource.md): Recurse through Sourceable objects and return the first one that is an instance of type, or undefined if no source object matches.
- [requireSource](source/requireSource.md): Recurse through Sourceable objects and return the first one that is an instance of type, or throw RequiredError if no source object matches.

## Interfaces

- [Sourceable](source/Sourceable.md): Something that has a source of a specified type.
