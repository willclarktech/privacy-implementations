import { bigInt2Buffer, buffer2BigInt } from "./";

describe("bigInt2Buffer", () => {
	it.each([
		[0n, Buffer.from([0x00])],
		[1n, Buffer.from([0x01])],
		[2n, Buffer.from([0x02])],
		[16n, Buffer.from([0x10])],
		[255n, Buffer.from([0xff])],
		[256n, Buffer.from([0x01, 0x00])],
		[65535n, Buffer.from([0xff, 0xff])],
		[65536n, Buffer.from([0x01, 0x00, 0x00])],
		[
			9007199254740992n,
			Buffer.from([0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
		],
	])("creates a buffer from %d = %o", (a, expected) => {
		const actual = bigInt2Buffer(a);
		expect(actual.equals(expected)).toStrictEqual(true);
	});
});

describe("buffer2BigInt", () => {
	it.each([
		[Buffer.alloc(8, 0x00), 0n],
		[Buffer.concat([Buffer.alloc(7, 0x00), Buffer.from([0x01])]), 1n],
		[Buffer.concat([Buffer.alloc(7, 0x00), Buffer.from([0x02])]), 2n],
		[Buffer.concat([Buffer.alloc(7, 0x00), Buffer.from([0x10])]), 16n],
		[Buffer.concat([Buffer.alloc(7, 0x00), Buffer.from([0xff])]), 255n],
		[Buffer.concat([Buffer.alloc(6, 0x00), Buffer.from([0x01, 0x00])]), 256n],
		[Buffer.concat([Buffer.alloc(6, 0x00), Buffer.from([0xff, 0xff])]), 65535n],
		[
			Buffer.concat([Buffer.alloc(5, 0x00), Buffer.from([0x01, 0x00, 0x00])]),
			65536n,
		],
		[
			Buffer.from([0x00, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
			9007199254740992n,
		],
	])("creates a bigint from %o = %d", (a, expected) => {
		const actual = buffer2BigInt(a);
		expect(actual).toStrictEqual(expected);
	});
});
