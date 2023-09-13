import { ClassTransformOptions, instanceToPlain } from 'class-transformer';

/**
 * Serializes the given object to a plain object with global configuration.
 *
 * @param object
 * @returns
 */
export function serialize(object: unknown, options?: ClassTransformOptions): any;
export function serialize(object: unknown, groups: string[]): any;
export function serialize(object: unknown, options: string[] | ClassTransformOptions = {}): any {
	if (Array.isArray(options)) {
		options = { groups: options };
	}

	if (typeof object !== 'object') {
		return object;
	}

	return instanceToPlain(object, {
		excludePrefixes: ['_'],
		exposeDefaultValues: true,
		...options,
	})
}
