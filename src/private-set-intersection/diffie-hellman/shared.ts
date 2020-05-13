import { Party } from "../../cryptosystem/diffie-hellman";
import { hashNumber, isGenerator, phi } from "../../util";

export type SharedOptions = {
	readonly p?: bigint;
	readonly g?: bigint;
	readonly bitLength?: number;
	readonly hashAlgorithm?: string;
};

export class Shared {
	protected readonly party: Party;
	protected readonly hashAlgorithm: string;
	protected readonly set: Set<number>;
	protected readonly totient: bigint;

	constructor(
		initialSet: Set<number>,
		{ p, g, bitLength, hashAlgorithm = "sha256" }: SharedOptions = {},
	) {
		this.party = new Party({ p, g, bitLength });
		this.hashAlgorithm = hashAlgorithm;
		this.set = initialSet;
		this.totient = phi(this.party.p);
	}

	public addElement(element: number): void {
		this.set.add(element);
	}

	public removeElement(element: number): void {
		this.set.delete(element);
	}

	public get p(): bigint {
		return this.party.p;
	}

	public get g(): bigint {
		return this.party.g;
	}

	private prepareIntermediateValue(n: number | bigint): bigint {
		const hashOutput = hashNumber(this.hashAlgorithm, BigInt(n));
		return isGenerator(this.party.p, hashOutput, this.totient)
			? this.party.raise(hashOutput)
			: this.prepareIntermediateValue(hashOutput);
	}

	public prepareIntermediateValues(): readonly bigint[] {
		return [...this.set.values()].map(this.prepareIntermediateValue.bind(this));
	}

	public prepareIntermediateSortedValues(): readonly bigint[] {
		const intermediateValues = this.prepareIntermediateValues();
		return Array.from(intermediateValues).sort();
	}
}
