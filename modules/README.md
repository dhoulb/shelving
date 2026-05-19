# Shelving

Shelving is a TypeScript toolkit for working with typed data. At its core it is a schema validation library — every schema has a `validate()` method that returns a typed value or throws a human-readable error. On top of that it provides a database provider abstraction, an API provider abstraction, observable state stores, React integration, and a large set of typed utility functions.

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

## Modules

| Module | Description |
|---|---|
| [schema](./schema/README.md) | Schema validation — the foundation of everything |
| [db](./db/README.md) | Database provider abstraction (Collections, providers, queries) |
| [api](./api/README.md) | API provider abstraction (Endpoints, providers, caching) |
| [store](./store/README.md) | Observable state containers, Suspense-compatible |
| [sequence](./sequence/README.md) | Async-iterable utilities (`DeferredSequence`) |
| [react](./react/README.md) | React hooks for stores and sequences |
| [error](./error/README.md) | Typed error classes |
| [util](./util/README.md) | Typed helpers for arrays, objects, strings, data, queries, updates |
| [markup](./markup/README.md) | Markdown renderer for user-facing content |
| [cloudflare](./cloudflare/README.md) | Cloudflare Workers providers (KV, D1) |
| [firestore](./firestore/README.md) | Firestore providers (client, lite, server) |
| [bun](./bun/README.md) | Bun PostgreSQL provider |

## Changelog

See [Releases](https://github.com/dhoulb/shelving/releases) on GitHub.
