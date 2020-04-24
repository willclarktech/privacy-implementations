export class BitArray {
	public readonly bitLength: number;
	private bits: bigint;

	constructor(bitLength: number) {
		this.bitLength = bitLength;
		this.bits = 0n;
	}

	public set(i: number): void {
		if (i < 0 || i >= this.bitLength) {
			throw new Error("Bit index out of range");
		}
		this.bits |= 1n << BigInt(i);
	}

	public has(i: number): boolean {
		return !!(this.bits & (1n << BigInt(i)));
	}
}
