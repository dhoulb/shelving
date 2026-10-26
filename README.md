# Shelving

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://www.conventionalcommits.org/) [![Release](https://github.com/dhoulb/shelving/actions/workflows/release.yaml/badge.svg)](https://github.com/dhoulb/shelving/actions/workflows/release.yaml) [![npm](https://img.shields.io/npm/dm/shelving.svg)](https://www.npmjs.com/package/shelving)

TypeScript data toolkit — schema validation, database and API providers, observable state stores, React integration, and typed utility functions.

## Documentation

Full documentation is published at **<https://shelving.cc/>**.

```sh
npm install shelving
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

See [Releases](https://github.com/dhoulb/shelving/releases).
