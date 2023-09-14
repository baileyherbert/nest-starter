import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { CustomLogger, logger } from './abstract/logger';
import { TrimPipe } from './abstract/pipes/TrimPipe';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { EntityNotFoundExceptionFilter } from './abstract/filters/EntityNotFoundExceptionFilter';
import { Environment } from './app.environment';
import { Nest } from './abstract/globals/Nest';

async function bootstrap() {
	const app = Nest.app = await NestFactory.create<NestExpressApplication>(AppModule, {
		logger: new CustomLogger(),
		forceCloseConnections: true
	});

	app.useGlobalPipes(new TrimPipe());
	app.useGlobalPipes(new ValidationPipe({
		transform: true,
		transformOptions: {
			enableImplicitConversion: true,
		},
		forbidUnknownValues: true,
		skipMissingProperties: false,
		skipUndefinedProperties: false,
		skipNullProperties: false,
		stopAtFirstError: true,
		whitelist: true,
	}));

	app.useGlobalFilters(new EntityNotFoundExceptionFilter());
	app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector), {
		excludePrefixes: ['_'],
		exposeDefaultValues: true,
	}));

	app.enableShutdownHooks();
	app.set('trust proxy', Environment.APP_TRUSTED_PROXY);

	await app.listen(getListeningPort());

	if (typeof global.gc === 'function') {
		const runGarbageCollector = () => {
			const start = Date.now(); gc!();
			const end = Date.now(); const took = end - start;
			const timeout = (Math.floor(took / 100) * 10000) + 120000;

			setTimeout(runGarbageCollector, timeout).unref();
		};

		runGarbageCollector();
	}
	else if (process.env.NODE_ENV === 'production') {
		logger.warning('Application was started without gc exposed, memory usage may be elevated');
	}
}
/**
 * Returns the port number to use for the server.
 *
 * @returns
 */
function getListeningPort() {
	if (typeof Environment.APP_PORT === 'number') {
		return Environment.APP_PORT;
	}

	const url = new URL(Environment.APP_URL);

	if (url.port === '') {
		return 3000;
	}

	return parseInt(url.port, 10);
}

bootstrap();
