import BN from "bn.js";
import { curve, ec as EllipticCurve } from "elliptic";

import { bigInt2Array } from "../util";

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
		this.privateKeyInverse = this.privateKey.invm(this.curve.n);
	}

	public raise(g: bigint, shouldHash = false): bigint {
		const point = shouldHash
			? this.hashToPoint(g)
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

	private hashToPoint(input: bigint): curve.short.ShortPoint {
		const hashOutput = this.ec.hash().update(bigInt2Array(input)).digest();
		const x = new BN(hashOutput).mod(this.curve.p);
		try {
			return this.curve.pointFromX(x);
		} catch (error) {
			if (/invalid point/i.test(error)) {
				return this.hashToPoint(BigInt(x));
			}
			throw error;
		}
	}
}
