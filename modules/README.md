# Shelving

Shelving is a TypeScript toolkit for working with typed data. At its core it is a schema validation library — every schema has a `Schema.validate()` method that returns a typed value or throws a human-readable error. On top of that it provides a database provider abstraction, an API provider abstraction, observable state stores, React integration, and a large set of typed utility functions.

> Note: Shelving is in active development and does not yet follow semver.

## Installation

```sh
npm install shelving
```

Shelving is an ES module. Import from the main package or from individual module subpaths:

```ts
import { STRING, DataSchema } from "shelving"
import { MemoryDBProvider } from "shelving/db"
```

## Changelog

See [Releases](https://github.com/dhoulb/shelving/releases) on GitHub.

## Modules