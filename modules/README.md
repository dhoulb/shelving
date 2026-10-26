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

## For AI agents

The docs are also published as Markdown for LLMs and coding agents:

- <https://shelving.cc/llms.txt> is the index. <https://shelving.cc/llms-full.txt> has every page in one file.
- Add `.md` to any docs page path to get that page as Markdown, for example <https://shelving.cc/schema/StringSchema.md>.
- The npm package includes the same files in `node_modules/shelving/docs/`, so an agent can read the docs for the installed version without network access.
- The npm package also includes an [Agent Skill](https://agentskills.io/) at `node_modules/shelving/skills/shelving/SKILL.md`. It tells an agent where the docs are and which conventions to follow. To use it with Claude Code, link it into your project:

  ```sh
  mkdir -p .claude/skills && ln -s ../../node_modules/shelving/skills/shelving .claude/skills/shelving
  ```

## Changelog

See [Releases](https://github.com/dhoulb/shelving/releases) on GitHub.

## Modules