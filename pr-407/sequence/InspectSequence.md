# InspectSequence

- Kind: class
- Import: `import { InspectSequence } from "shelving/sequence";`
- Extends: `ThroughSequence<T, R, N>`

Sequence of values that inspects a source sequence of values as it iterates.
- Stores: first/last yielded value, returned value, whether iteration is done, the number of items that were iterated.

A `ThroughSequence` that records what passes through it without changing the values. As it iterates a source sequence it tracks the `first` and `last` yielded values, the `count` of values, whether iteration is `done`, and the final `returned` value.

Useful in tests and diagnostics when you need to assert on what a sequence produced.

## Usage

```ts
import { InspectSequence } from "shelving/sequence";

async function* numbers() {
  yield 10; yield 20; yield 30;
}

const watch = new InspectSequence(numbers());
for await (const n of watch) {
  console.log("yielded", n);
}

console.log(watch.count);  // 3
console.log(watch.first);  // 10
console.log(watch.last);   // 30
console.log(watch.done);   // true
```

`first`, `last`, and `returned` throw an `UnexpectedError` if read before the relevant values exist — e.g. `first` before iteration has yielded anything, or `returned` before iteration is `done`.


## Signatures

```ts
new InspectSequence<T, R, N>()
```

## Returns

| Type | Description |
| --- | --- |
| `InspectSequence<T, R, N>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `count` | `unknown` | The number of values yielded by the source sequence so far. Read only. |
| `done` | `unknown` | Whether the source sequence has finished iterating (i.e. it has returned). Read only. |
| `first` | `T` | The first value yielded by the source sequence. - Throws if the iteration yielded no values yet, i.e. `this.count === 0`. Read only. |
| `last` | `T` | The last value yielded by the source sequence. - Throws if the iteration yielded no values yet, i.e. `this.count === 0`. Read only. |
| `returned` | `R \| undefined` | The value returned by the source sequence when it finished. - Throws if the iteration is not done yet, i.e. `this.done === false`. Read only. |
