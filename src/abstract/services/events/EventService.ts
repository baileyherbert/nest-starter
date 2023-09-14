import { NestedSet } from '@baileyherbert/nested-collections';
import { Constructor, Type } from '@baileyherbert/types';
import { Injectable } from '@nestjs/common';
import { Service } from 'src/abstract/architecture/Service';
import { NestEvent } from './Event';
import { EventListenerHandle } from './EventListenerHandle';
import { isConstructor } from 'src/abstract/functions/type-guards';
import { EventRegistry } from './EventRegistry';
import { Nest } from 'src/abstract/globals/Nest';

@Injectable()
export class EventsService extends Service {

	public constructor() {
		super();
		Nest.events = this;
	}

	/**
	 * The listeners that are currently attached.
	 */
	protected listeners = new NestedSet<Type<NestEvent<any>>, EventHandlerDescriptor>();

	/**
	 * The listeners that should be cleaned up when the application restarts.
	 */
	protected ephemeral = new Set<EventListenerHandle>();


	/**
	 * Emits an event of the specified type with the given data.
	 * @param event A reference to the event constructor.
	 * @param data The data to use for the event.
	 */
	public override emit<T>(event: Constructor<NestEvent<T>>, data: T): void;
	public override emit<T>(event: Constructor<NestEvent<void | undefined>>): void;

	/**
	 * Emits the given event.
	 * @param event An event instance.
	 */
	public override emit<T>(event: NestEvent<T>): void;
	public override emit<T>(event: Constructor<NestEvent<T>> | NestEvent<any>, data?: T): void {
		if (isConstructor(event)) {
			event = new event(data);
		}

		(async () => {
			for (const descriptor of this.listeners.values(event.constructor)) {
				try {
					descriptor.handler(event);

					// Auto remove 'once' handlers
					if (descriptor.once) {
						this.listeners.delete(event.constructor, descriptor);
					}
				}
				catch (error) {
					this.logger.error('Error in event handler (descriptor):', error);
				}
			}
		})();
	}

	/**
	 * Listens for an event.
	 * @param event A reference to the event constructor.
	 * @param handler A callback to handle the event.
	 * @returns An instance that can be used to manually detach the event listener.
	 */
	public on<T>(event: Type<NestEvent<T>>, handler: EventHandler): EventListenerHandle {
		return this.attach(event, false, handler);
	}

	/**
	 * Listens for an event once and then automatically detaches.
	 * @param event A reference to the event constructor.
	 * @param handler A callback to handle the event.
	 * @returns An instance that can be used to manually detach the event listener.
	 */
	public once(event: Type<NestEvent<any>>, handler: EventHandler): EventListenerHandle {
		return this.attach(event, true, handler);
	}

	/**
	 * Attaches an event handler.
	 * @param event A reference to the event constructor.
	 * @param once A boolean indicating if the listener should be removed after the first invocation.
	 * @param handler A callback to handle the event.
	 * @returns An instance that can be used to manually detach the event listener.
	 */
	protected attach(event: Type<NestEvent<any>>, once: boolean, handler: EventHandler): EventListenerHandle {
		const descriptor = { handler, once };
		this.listeners.add(event, descriptor);

		return new EventListenerHandle(() => {
			this.listeners.delete(event, descriptor);
		});
	}

	/**
	 * Removes an event listener.
	 * @param event A reference to the event constructor.
	 * @param handler A callback to handle the event.
	 */
	public removeListener(event: Type<NestEvent<any>>, handler: (event: NestEvent<any>) => void) {
		// Find a matching descriptor
		for (const descriptor of this.listeners.values(event)) {
			if (descriptor.handler === handler) {
				this.listeners.delete(event, descriptor);
				break;
			}
		}
	}

	protected override async onModuleInit() {
		const classes = EventRegistry.getTypes();

		for (const target of classes) {
			const handlers = EventRegistry.getMethods(target);
			const instance = await Nest.app.get(target);

			for (const [methodName, eventType] of handlers) {
				const handle = this.on(eventType, e => {
					const method = (instance as any)[methodName] as EventHandler;

					try {
						const response = method.call(instance, e);

						if (typeof response === 'object' && typeof response.then === 'function') {
							this.track(response);

							response.catch((error: any) => {
								this.logger.error('Error in event handler:', error);
							});
						}
					}
					catch (error) {
						this.logger.error('Error in event handler:', error);
					}
				});

				this.ephemeral.add(handle);
			}
		}
	}

	protected override async onModuleDestroy() {
		await this.waitForPendingPromises();
	}

}

type EventHandler = (event: NestEvent<any>) => any;
type EventHandlerDescriptor = {
	handler: EventHandler;
	once: boolean;
}
