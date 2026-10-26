# MarkupParser.parse()

- Kind: method
- Member of: `MarkupParser`

Parse a text string as Markdownish markup syntax and render it as a React node.
- Syntax is not defined by this code, but by the rules supplied to it.
- **Untrusted input:** parsing is linear for normal content, but a few rules can still degrade on adversarial
  input — long unbroken runs of backtick code fences, and deeply-nested `>` blockquotes (each leading `>`
  recurses one level, so a pathological line can overflow the stack). When `input` is user-generated, cap its
  length first; a sane maximum for your use case (for typical user content, tens of kilobytes) bounds worst-case work.

## Signatures

```ts
parse(input: string, context = this.context): ReactNode
```
