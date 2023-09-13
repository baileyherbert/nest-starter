import { Expose, Transform } from 'class-transformer';

/**
 * Applies a transform to a lazy-loaded relation property which exposes its underlying value when available.
 *
 * @param defaultValue The default value to return if the relation is not loaded. If not specified, `null` is used,
 *   but you can also specify `undefined` to omit the property from the response.
 *
 * @returns
 */
export function ExposeLazyRelation(defaultValue?: any, groups?: string[]): PropertyDecorator {
	return function (target: any, propertyName: string | symbol) {
		const valueName = '__' + String(propertyName) + '__';

		Expose({ name: String(propertyName), groups })(target, propertyName);
		Transform(params => {
			const value = (params.obj[valueName]) ? params.obj[valueName] : undefined;
			return value ?? defaultValue;
		})(target, propertyName);
	}
}
