import { strict as assert } from "assert";
import { randBetween } from "bigint-crypto-utils";

import {
	add,
	multiply,
	PublicKey,
} from "../../homomorphic-encryption/paillier";

export class Server {
	private readonly set: Set<number>;

	constructor(initialSet: Set<number>) {
		this.set = initialSet;
	}

	public addElement(element: number): void {
		this.set.add(element);
	}

	public removeElement(element: number): void {
		this.set.delete(element);
	}

	public revealIntersection(
		publicKey: PublicKey,
		values: readonly bigint[],
	): readonly bigint[] {
		const multiplyForPublicKey = multiply(publicKey);
		return values.map((n, i) =>
			multiplyForPublicKey(n, BigInt(this.set.has(i))),
		);
	}

	public revealIntersectionSize(
		publicKey: PublicKey,
		values: readonly bigint[],
	): bigint {
		const intersection = this.revealIntersection(publicKey, values);
		assert.notEqual(intersection.length, 0);

		const addForPublicKey = add(publicKey);
		return intersection
			.slice(1)
			.reduce((sum, n) => addForPublicKey(sum, n), intersection[0]);
	}

	public revealIntersectionNonEmpty(
		publicKey: PublicKey,
		values: readonly bigint[],
	): bigint {
		const intersectionSize = this.revealIntersectionSize(publicKey, values);
		const r = randBetween(publicKey.n);
		return multiply(publicKey)(intersectionSize, r);
	}
}
