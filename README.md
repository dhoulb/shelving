# Shelving

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org) [![GitHub Actions](https://github.com/dhoulb/shelving/workflows/CI/badge.svg?branch=main)](https://github.com/dhoulb/shelving/actions) [![npm](https://img.shields.io/npm/dm/shelving.svg)](https://www.npmjs.com/package/shelving)

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
| [schema](modules/schema/README.md) | Schema validation — the foundation of everything |
| [db](modules/db/README.md) | Database provider abstraction (Collections, providers, queries) |
| [api](modules/api/README.md) | API provider abstraction (Endpoints, providers, caching) |
| [store](modules/store/README.md) | Observable state containers, Suspense-compatible |
| [sequence](modules/sequence/README.md) | Async-iterable utilities (`DeferredSequence`) |
| [react](modules/react/README.md) | React hooks for stores and sequences |
| [error](modules/error/README.md) | Typed error classes |
| [util](modules/util/README.md) | Typed helpers for arrays, objects, strings, data, queries, updates |
| [markup](modules/markup/README.md) | Markdown renderer for user-facing content |
| [cloudflare](modules/cloudflare/README.md) | Cloudflare Workers providers (KV, D1) |
| [firestore](modules/firestore/README.md) | Firestore providers (client, lite, server) |
| [bun](modules/bun/README.md) | Bun PostgreSQL provider |

## Changelog

See [Releases](https://github.com/dhoulb/shelving/releases).
