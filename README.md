# Shelving: toolkit for using data in JavaScript

[![Semantic Release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat)](https://github.com/semantic-release/semantic-release) [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org) [![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier) [![GitHub Actions](https://github.com/dhoulb/shelving/workflows/CI/badge.svg?branch=main)](https://github.com/dhoulb/shelving/actions) [![npm](https://img.shields.io/npm/dm/shelving.svg)](https://www.npmjs.com/package/shelving)

**Shelving** is a toolkit for using data in JavaScript and TypeScript, including:

> Note: The `1.x` branch of Shelving is in active development and is not observing semver for breaking changes (from `2.x` onward semver will be followed).

- Schemas (validation)
- Databases (via providers including in-memory, Firestore, IndexedDB)
- Querying (sorting, filtering, slicing)
- Store (events and state)
- React (hooks and state)
- Helpers (errors, arrays, objects, strings, dates, equality, merging, diffing, cloning, debug)

## Installation

Install via `npm` or `yarn`:

```sh
npm install shelving
yarn add shelving
```

Import from Skypack CDN (the `?dts` enables TypeScript types in Deno):

```js
import { Database } from "https://cdn.skypack.dev/shelving";
import { Database } from "https://cdn.skypack.dev/shelving?dts";
```

## Usage

Shelving is an [ES module](https://nodejs.org/api/esm.html) supporting `import { Query } from "shelving";` syntax and can be used natively in systems/browsers that support that (e.g. Chrome 61+, Deno, Node 12+).

Shelving does not include code for CommonJS `require()` imports, so using it in older projects will require transpiling.

## Modules

Shelving is created from small individual modules which can be imported individually (using e.g. `import { addProp } from "shelving/object`). Modules marked with `✅` are also re-exported from the main `"shelving"` module.

@todo Write these docs!

## Changelog

See [Releases](https://github.com/dhoulb/shelving/releases)
