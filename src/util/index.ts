export const getBitLength = (a: bigint): number =>
	[0n, 1n].includes(a) ? 1 : 1 + getBitLength(a >> 1n);

export const getByteLength = (a: bigint): number =>
	Math.ceil(getBitLength(a) / 8);

export const bigInt2Buffer = (a: bigint): Buffer =>
	Buffer.from(a.toString(16), "hex");

export const bigInt2Array = (a: bigint): readonly number[] =>
	Array.from(bigInt2Buffer(a));

export const buffer2BigInt = (a: Buffer): bigint =>
	BigInt(`0x${a.toString("hex")}`);

export const array2BigInt = (a: readonly number[]): bigint =>
	buffer2BigInt(Buffer.from(a));
