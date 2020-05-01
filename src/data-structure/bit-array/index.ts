export class BitArray {
	public readonly bitLength: number | null;
	private bits: bigint;

	constructor(bitLength?: number) {
		this.bits = 0n;
		this.bitLength = bitLength === undefined ? null : bitLength;
	}

	public set(i: number): void {
		this.validateIndex(i);
		this.bits |= 1n << BigInt(i);
	}

	public has(i: number): boolean {
		this.validateIndex(i);
		return !!(this.bits & (1n << BigInt(i)));
	}

	private validateIndex(i: number): void {
		if (i < 0 || (this.bitLength !== null && i >= this.bitLength)) {
			throw new Error("Bit index out of range");
		}
	}
}
