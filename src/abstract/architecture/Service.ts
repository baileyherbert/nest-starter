import { Constructor } from '@baileyherbert/types';
import { Loggable } from './Loggable';
import { NestEvent } from '../services/events/Event';
import { isConstructor } from '../functions/type-guards';
import { Nest } from '../globals/Nest';

/**
 * The base class for services.
 */
export abstract class Service extends Loggable {

	/**
	 * The pending promises that we're tracking for graceful shutdowns.
	 */
	private readonly _outstandingPromises = new Set<Promise<any>>();

	/**
	 * Called once the host module's dependencies have been resolved.
	 */
	protected async onModuleInit() {

	}

	/**
	 * Called after a termination signal (e.g., `SIGTERM`) has been received.
	 */
	protected async onModuleDestroy() {
		await this.waitForPendingPromises();
	}

	/**
	 * Called once all modules have been initialized, but before listening for connections.
	 */
	protected async onApplicationBootstrap() {

	}

	/**
	 * Called after all `onModuleDestroy()` handlers have completed (Promises resolved or rejected);
	 * once complete (Promises resolved or rejected), all existing connections will be closed (`app.close()` called).
	 */
	protected async beforeApplicationShutdown() {

	}

	/**
	 * Called after connections close (`app.close()` resolves).
	 */
	protected async onApplicationShutdown() {

	}

	/**
	 * Tracks a promise and returns it.
	 *
	 * @param promise
	 * @returns
	 */
	protected track<T>(promise: Promise<T>): Promise<T> {
		this._outstandingPromises.add(promise);

		promise.then(
			() => this._outstandingPromises.delete(promise),
			() => this._outstandingPromises.delete(promise),
		);

		return promise;
	}

	/**
	 * Waits for all currently-tracked promises to resolve. This will be called automatically from within the default
	 * implementation of `onModuleDestroy()`, but can be called manually if needed.
	 */
	protected async waitForPendingPromises(): Promise<void> {
		await Promise.all(this._outstandingPromises);
	}

	/**
	 * Emits an event of the specified type with the given data.
	 * @param event A reference to the event constructor.
	 * @param data The data to use for the event.
	 */
	protected emit<T>(event: Constructor<NestEvent<T>>, data: T): void;
	protected emit<T>(event: Constructor<NestEvent<void | undefined>>): void;

	/**
	 * Emits the given event.
	 * @param event An event instance.
	 */
	protected emit<T>(event: NestEvent<T>): void;
	protected emit<T>(event: Constructor<NestEvent<T>> | NestEvent<any>, data?: T): void {
		if (isConstructor(event)) {
			event = new event(data, this);
		}

		Nest.events.emit(event);
	}

}
