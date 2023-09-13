import { ColumnOptions, UpdateDateColumn as RealUpdateDateColumn } from 'typeorm';

/**
 * Creates a `DateTime` column with millisecond precision which is set to the current time when the record is updated.
 *
 * @param options
 * @returns
 */
export function UpdateDateColumn(options?: ColumnOptions) {
	return RealUpdateDateColumn({
		precision: 3,
		default: () => 'CURRENT_TIMESTAMP(3)',
		onUpdate: 'CURRENT_TIMESTAMP(3)',
		...options,
	});
}
