# ansiWrap()

- Kind: function
- Import: `import { ansiWrap } from "shelving/util/ansi";`

Wrap a string in the ANSI color/style codes (at the start), and `ANSI_RESET` at the end.

- Colour is only emitted when the runtime supports it, resolved once at module load into `_USES_COLOR` — `FORCE_COLOR` > `NO_COLOR` > TTY detection > default-off.
- The default is *off* for non-interactive sinks (files, log aggregators, Workers), so escape codes never pollute non-TTY output unless `FORCE_COLOR` opts back in.

## Signatures

```ts
ansiWrap(input: string, ...wrappers: ImmutableArray<string>): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `input` | `string` | The string to wrap in ANSI codes. |
| `wrappers` | `ImmutableArray<string>` | Any number of ANSI escape codes (e.g. `ANSI_RED`, `ANSI_BOLD`) to prepend before `input`. |

## Returns

| Type | Description |
| --- | --- |
| `unknown` | The wrapped string, or `input` unchanged when colour is not supported (see precedence above). |
