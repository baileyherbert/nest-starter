import crypto from 'crypto';
import { Environment } from '../../app.environment';

/**
 * Computes a consumable, random 256-bit secret from the configured application secret using the specified number of
 * iterations, and returns it as a buffer.
 *
 * @param iterations
 * @param seed Optional data to seed the secret with.
 * @returns
 */
export function secret(iterations: number, seed?: Stringable) {
	const hash = crypto.createHash('sha256');
	hash.update(Environment.APP_SECRET);

	if (typeof seed !== 'undefined') {
		hash.update('seed=' + seed.toString());
	}

	for (let i = 0; i < iterations; i++) {
		hash.update('#=iteration=' + i + '=#');
		hash.update(Environment.APP_SECRET);
	}

	return hash.digest();
}

type Stringable = {
	toString(): string;
}
