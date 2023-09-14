import { Global, MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { NullInterceptor } from '../interceptors/NullInterceptor';
import { ContainerService } from '../services/ContainerService';
import { EventService } from '../services/events/EventService';
import { HttpLoggerMiddleware } from '../middleware/HttpLoggerMiddleware';
import { NextFunction, Request, Response } from 'express';

@Global()
@Module({
	imports: [],
	controllers: [],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: NullInterceptor,
		},
		ContainerService,
		EventService,
	],
	exports: [
		EventService,
	]
})
export class AbstractModule {

	public configure(consumer: MiddlewareConsumer) {
		consumer.apply(HttpLoggerMiddleware).forRoutes('/*');
		consumer.apply((_req: Request, res: Response, next: NextFunction) => {
			res.type('application/json');
			next();
		}).forRoutes('*');
	}

}
