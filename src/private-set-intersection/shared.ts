import { Party } from "../elliptic-curve-diffie-hellman";

export class Shared {
	protected readonly party: Party;
	protected readonly set: Set<bigint>;

	constructor(initialSet: Set<bigint>) {
		this.party = new Party();
		this.set = initialSet;
	}

	public addElement(element: bigint): void {
		this.set.add(element);
	}

	public removeElement(element: bigint): void {
		this.set.delete(element);
	}

	private prepareIntermediateValue(n: bigint): bigint {
		return this.party.raise(n, true);
	}

	public prepareIntermediateValues(): readonly bigint[] {
		return [...this.set.values()].map(this.prepareIntermediateValue.bind(this));
	}

	public prepareIntermediateSortedValues(): readonly bigint[] {
		const intermediateValues = this.prepareIntermediateValues();
		return (intermediateValues as bigint[]).sort();
	}
}
