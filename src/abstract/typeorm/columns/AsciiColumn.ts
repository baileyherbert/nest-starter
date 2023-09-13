import { ColumnOptions, Column } from 'typeorm';

/**
 * Defines a column that has been preconfigured with the `ascii_general_ci` collation.
 *
 * @param options
 * @returns
 */
export function AsciiColumn(options?: ColumnOptions) {
	return Column({
		...options,
		charset: 'ascii',
		collation: 'ascii_general_ci'
	});
}
