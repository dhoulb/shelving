# IteratorAbortResult

- Kind: interface
- Import: `import { IteratorAbortResult } from "shelving/util/sequence";`

Result of an iterator that was aborted via an external signal rather than concluding itself.
- `done` is the `ABORT` symbol, distinguishing it from an iterator's own `done: true` result.

## Signatures

```ts
{
	done: typeof ABORT;
	value: R;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `done` | `typeof ABORT` | Always the `ABORT` symbol, marking this result as an external abort rather than the iterator finishing. |
| `value` | `R` | The value the abort signal resolved with. |
