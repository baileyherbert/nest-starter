import { ColumnOptions, DeleteDateColumn as RealDeleteDateColumn } from 'typeorm';

/**
 * Creates a `DateTime` column with millisecond precision which is set to the current time when the record is deleted.
 *
 * @param options
 * @returns
 */
export function DeleteDateColumn(options?: ColumnOptions) {
	return RealDeleteDateColumn({
		precision: 3,
		...options,
	});
}
