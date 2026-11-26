# STOPHOLE

- Kind: constant
- Import: `import { STOPHOLE } from "shelving/util/start";`

Callback function that does nothing and returns a blackhole stop callback.
- Useful as a no-op default where a `StartCallback` is expected.

## Signatures

```ts
STOPHOLE: (...args: Arguments) => StopCallback
```
