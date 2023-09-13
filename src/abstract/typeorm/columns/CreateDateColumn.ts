import { ColumnOptions, CreateDateColumn as RealCreateDateColumn } from 'typeorm';

/**
 * Creates a `DateTime` column with millisecond precision which is set to the current time when the record is created.
 *
 * @param options
 * @returns
 */
export function CreateDateColumn(options?: ColumnOptions) {
	return RealCreateDateColumn({
		precision: 3,
		default: () => 'CURRENT_TIMESTAMP(3)',
		...options,
	});
}
