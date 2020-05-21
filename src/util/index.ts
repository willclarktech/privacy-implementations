export const bigInt2Buffer = (a: bigint, numBytes?: number): Buffer => {
	const hex = a.toString(16);
	const buffer = Buffer.from(hex.length % 2 ? `0${hex}` : hex, "hex");
	if (numBytes !== undefined) {
		const byteLength = buffer.length;
		if (numBytes < byteLength) {
			throw new Error("numBytes not large enough");
		}
		return Buffer.concat([Buffer.alloc(numBytes - byteLength, 0), buffer]);
	}
	return buffer;
};

export const bigInt2Array = (a: bigint): readonly number[] =>
	Array.from(bigInt2Buffer(a));

export const buffer2BigInt = (a: Buffer): bigint =>
	BigInt(`0x${a.toString("hex")}`);
