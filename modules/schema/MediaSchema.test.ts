import { describe, expect, test } from "bun:test";
import {
	FileSchema,
	IMAGE,
	ImageSchema,
	MEDIA,
	MediaSchema,
	NULLABLE_IMAGE,
	NULLABLE_MEDIA,
	NULLABLE_VIDEO,
	type Schema,
	VIDEO,
	VideoSchema,
} from "shelving/schema";
import { IMAGE_TYPES, MEDIA_TYPES, VIDEO_TYPES } from "shelving/util/file";

test("TypeScript", () => {
	const s1: Schema<string> = MEDIA;
	const s2: Schema<string> = IMAGE;
	const s3: Schema<string> = VIDEO;
	const s4: Schema<string | null> = NULLABLE_MEDIA;
	const s5: Schema<string | null> = NULLABLE_IMAGE;
	const s6: Schema<string | null> = NULLABLE_VIDEO;
});
test("constructor()", () => {
	expect(MEDIA).toBeInstanceOf(FileSchema);
	expect(IMAGE).toBeInstanceOf(MediaSchema);
	expect(VIDEO).toBeInstanceOf(MediaSchema);
	expect(MEDIA.types).toBe(MEDIA_TYPES);
	expect(IMAGE.types).toBe(IMAGE_TYPES);
	expect(VIDEO.types).toBe(VIDEO_TYPES);
	expect(MEDIA.capture).toBeUndefined();
	expect(new ImageSchema({ capture: "user" }).capture).toBe("user");
	expect(new VideoSchema({ capture: "environment" }).capture).toBe("environment");
	expect(new ImageSchema({ types: { webp: "image/webp" } }).types).toEqual({ webp: "image/webp" });
});
describe("validate()", () => {
	test("MEDIA allows images and videos", () => {
		expect(MEDIA.validate("photo.jpg")).toBe("photo.jpg");
		expect(MEDIA.validate("clip.mp4")).toBe("clip.mp4");
		expect(() => MEDIA.validate("notes.txt")).toThrow();
	});
	test("IMAGE allows images only", () => {
		expect(IMAGE.validate("photo.webp")).toBe("photo.webp");
		expect(() => IMAGE.validate("clip.mp4")).toThrow();
	});
	test("VIDEO allows videos only", () => {
		expect(VIDEO.validate("clip.mov")).toBe("clip.mov");
		expect(() => VIDEO.validate("photo.jpg")).toThrow();
	});
});
