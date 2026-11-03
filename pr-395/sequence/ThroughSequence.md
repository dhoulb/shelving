# ThroughSequence

- Kind: class
- Import: `import { ThroughSequence } from "shelving/sequence";`
- Extends: `Sequence<T, R | undefined, N | undefined>`

Async iterable that pulls values from a source async iterable.
- Can be used to turn an `AsyncIterator` into an `AsyncIterableIterator`
- Can be used to ensure `throw()` and `return()` are always set on an `AsyncIterator`

Wraps a source `AsyncIterator` and presents it as a full `Sequence`. Use it to turn a bare async iterator into a reusable `AsyncIterable`, and to guarantee `return()` and `throw()` are always available — delegating to the source when it provides them.

`ThroughSequence` is the base class for `LazySequence` and `InspectSequence`, which add behaviour on top of the pass-through.

## Usage

```ts
import { ThroughSequence } from "shelving/sequence";

async function* numbers() {
  yield 1; yield 2; yield 3;
}

const seq = new ThroughSequence(numbers());
for await (const n of seq) {
  console.log(n); // 1, 2, 3
}
```


## Signatures

```ts
new ThroughSequence<T, R, N>(source: AsyncIterator<T, R | undefined, N | undefined>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `source` | `AsyncIterator<T, R \| undefined, N \| undefined>` |  |

## Returns

| Type | Description |
| --- | --- |
| `ThroughSequence<T, R, N>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `source` | `AsyncIterator<T, R \| undefined, N \| undefined>` | Source async iterator that this sequence pulls values from. Read only. |

## Methods

- [ThroughSequence.next()](ThroughSequence/next.md)
