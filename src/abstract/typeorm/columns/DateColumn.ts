import { ColumnOptions, Column } from 'typeorm';

/**
 * Creates a `DateTime` column with millisecond precision.
 *
 * @param options
 * @returns
 */
export function DateColumn(options?: ColumnOptions) {
	return Column({
		type: 'datetime',
		precision: 3,
		...options,
	});
}
