import { logger } from '../logger';

export abstract class Loggable {

	/**
	 * The logger for this class.
	 */
	protected readonly logger = logger.createChild(this.constructor.name);

}
