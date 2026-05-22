export abstract class Parser<I, O> {
	abstract parse(input: I): O;
}
