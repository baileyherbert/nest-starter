import { NestExpressApplication } from '@nestjs/platform-express';
import { EventsService } from '../services/events/EventService';

export const Nest = ({} as any) as GlobalNestType;

interface GlobalNestType {
	app: NestExpressApplication;
	events: EventsService;
}
