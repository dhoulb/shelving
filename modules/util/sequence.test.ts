import { Signal, repeatDelay, repeatUntil } from "../index.js";

test("repeatUntil() and repeatDelay()", async () => {
	const yielded: number[] = [];
	const stop = new Signal();
	for await (const count of repeatUntil(repeatDelay(50), stop)) {
		yielded.push(count);
		if (count >= 3) stop.send();
	}
	expect(yielded).toEqual([1, 2, 3]);
});
