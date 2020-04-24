export { BitArray } from "./bit-array";

export const getBitLength = (a: bigint): number =>
	[0n, 1n].includes(a) ? 1 : 1 + getBitLength(a >> 1n);

export const getByteLength = (a: bigint): number =>
	Math.ceil(getBitLength(a) / 8);

const MIN_BUFFER_SIZE = 8;

export const bigInt2Buffer = (a: bigint): Buffer => {
	const byteLength = Math.max(MIN_BUFFER_SIZE, getByteLength(a) + 1);
	const buffer = Buffer.alloc(byteLength);
	buffer.writeBigUInt64BE(a);
	return buffer;
};

export const buffer2BigInt = (a: Buffer): bigint => a.readBigUInt64BE();
