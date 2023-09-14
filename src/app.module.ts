import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from './typeorm';
import { CustomRepositoriesModule } from './abstract/modules/CustomRepositoriesModule';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { NullInterceptor } from './abstract/interceptors/NullInterceptor';
import { HttpLoggerMiddleware } from './abstract/middleware/HttpLoggerMiddleware';
import { NextFunction, Request, Response } from 'express';
import { EventsService } from './abstract/services/events/EventService';

@Module({
	imports: [
		TypeOrmModule.forRoot(config),
		CustomRepositoriesModule.forRoot(config),
	],
	controllers: [],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: NullInterceptor,
		},
		EventsService
	],
})
export class AppModule {

	public configure(consumer: MiddlewareConsumer) {
		consumer.apply(HttpLoggerMiddleware).forRoutes('/*');
		consumer.apply((_req: Request, res: Response, next: NextFunction) => {
			res.type('application/json');
			next();
		}).forRoutes('*');
	}

}
