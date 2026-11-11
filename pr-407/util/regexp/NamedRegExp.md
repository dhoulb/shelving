# NamedRegExp

- Kind: interface
- Import: `import { NamedRegExp } from "shelving/util/regexp";`
- Extends: `RegExp`

Regular expression that contains the specified named capture groups.

## Signatures

```ts
{
	exec(input: string): NamedRegExpExecArray<T> | null;
}
```

## Methods

- [NamedRegExp.exec()](NamedRegExp/exec.md)
