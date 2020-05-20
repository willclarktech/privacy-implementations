import { modInv } from "bigint-crypto-utils";
import BN from "bn.js";
import { curve, ec as EllipticCurve } from "elliptic";

import { array2BigInt, bigInt2Array, bigInt2Buffer } from "../util";

export type PartyOptions = {};

export class Party {
	private readonly ec: EllipticCurve;
	private readonly curve: curve.short;
	private readonly privateKey: BN;
	private readonly privateKeyInverse: BN;

	constructor(_options: PartyOptions = {}) {
		this.ec = new EllipticCurve("p256");
		this.curve = this.ec.curve as curve.short;
		const keyPair = this.ec.genKeyPair();
		this.privateKey = keyPair.getPrivate();
		this.privateKeyInverse = new BN(
			bigInt2Buffer(modInv(BigInt(this.privateKey), BigInt(this.curve.n))),
		);
	}

	public raise(g: bigint, shouldHash = false): bigint {
		const point = shouldHash
			? this.hashToPoint(bigInt2Array(g))
			: this.curve.pointFromX(bigInt2Array(g));
		const multiplicationPoint = point.mul(this.privateKey);
		return BigInt(multiplicationPoint.getX());
	}

	public raiseInverse(g: bigint): bigint {
		const point = this.curve.pointFromX(bigInt2Array(g));
		const multiplicationPoint = point.mul(this.privateKeyInverse);
		return BigInt(multiplicationPoint.getX());
	}

	public get intermediateValue(): bigint {
		return this.raise(BigInt(this.ec.g.x), true);
	}

	private hashToPoint(input: readonly number[]): curve.short.ShortPoint {
		const hashOutput = this.ec.hash().update(input).digest();
		const x = array2BigInt(hashOutput) % BigInt(this.curve.p);
		try {
			return this.curve.pointFromX(bigInt2Array(x));
		} catch (error) {
			if (/invalid point/i.test(error)) {
				return this.hashToPoint(bigInt2Array(x));
			}
			throw error;
		}
	}
}
