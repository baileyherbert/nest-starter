import { NestEvent } from './Event';

/**
 * Utility type that extracts the type of data stored in the given event class.
 */
export type EventData<E extends NestEvent<any>> = E extends { data: infer T } ? T : void;
