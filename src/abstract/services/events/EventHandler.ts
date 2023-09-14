import { Attribute, AttributeMethodEvent, ReflectionClass } from '@baileyherbert/reflection';
import { NestEvent } from './Event';
import { EventRegistry } from './EventRegistry';

class EventHandlerImpl extends Attribute {

	public override onMethod(event: AttributeMethodEvent) {
		const param = event.reflection.getParameter(0);

		if (!param) {
			throw new Error(
				`Could not set method ${event.reflection.class.name}.${event.methodName.toString()}() as an event ` +
				`handler: missing event parameter #0`
			);
		}

		if (!param.isClassType) {
			throw new Error(
				`Could not set method ${event.reflection.class.name}.${event.methodName.toString()}() as an event ` +
				`handler: event parameter #0 is not a class type`
			);
		}

		const reference = new ReflectionClass(param.getType());

		if (!reference.hasAncestorType(NestEvent)) {
			throw new Error(
				`Could not set method ${event.reflection.class.name}.${event.methodName.toString()}() as an event ` +
				`handler: event parameter #0 does not extend the base Event class`
			);
		}

		EventRegistry.register(event.reflection.class.target, event.methodName as string, reference.target);
	}

}

/**
 * Marks a method as an event handler. The method must have a single argument which refers to the target event class.
 */
export const EventHandler = Attribute.create(EventHandlerImpl);
