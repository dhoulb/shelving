import { describe, expect, test } from "bun:test";
import { TransitionScrub } from "shelving/ui";

describe("TransitionScrub", () => {
	test("runs the update at once", () => {
		let runs = 0;
		const scrub = new TransitionScrub(() => {
			runs++;
		});
		expect(runs).toBe(1);
		expect(scrub.started).toBe(true);
	});
	test("is not started when the update returns false", () => {
		expect(new TransitionScrub(() => false).started).toBe(false);
	});
	test("without view transitions, cancel runs the undo", async () => {
		let undone = false;
		const scrub = new TransitionScrub(() => undefined);
		scrub.seek(0.5);
		await scrub.cancel(() => {
			undone = true;
		});
		expect(undone).toBe(true);
	});
	test("without view transitions, finish ends at once", async () => {
		await new TransitionScrub(() => undefined).finish();
	});
});
