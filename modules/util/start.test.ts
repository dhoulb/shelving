import { expect, test } from "bun:test";
import { Starter } from "shelving/util/start";

test("Starter starts once, stops once, and starts again after a stop", () => {
	const calls: string[] = [];
	const starter = new Starter(() => {
		calls.push("start");
		return () => calls.push("stop");
	});
	starter.start();
	starter.start();
	starter.stop();
	starter.stop();
	starter.start();
	starter.stop();
	expect(calls).toEqual(["start", "stop", "start", "stop"]);
});
