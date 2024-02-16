import { NestExpressApplication } from '@nestjs/platform-express';
import { Nest } from './globals/Nest';
import { Environment } from 'src/app.environment';
import { logger } from './logger';
import { TrimPipe } from './pipes/TrimPipe';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { EntityNotFoundExceptionFilter } from './filters/EntityNotFoundExceptionFilter';
import { Reflector } from '@nestjs/core';

/**
 * Configures and starts the Nest application.
 *
 * @param app
 */
export async function configure(app: NestExpressApplication) {
	// Record the instance to the global Nest object
	Nest.app = app;

	// Enable global pipes
	app.useGlobalPipes(new TrimPipe());
	app.useGlobalPipes(new ValidationPipe({
		transform: true,
		transformOptions: {
			enableImplicitConversion: true,
		},
		forbidUnknownValues: true,
		forbidNonWhitelisted: true,
		skipMissingProperties: false,
		skipUndefinedProperties: false,
		skipNullProperties: false,
		stopAtFirstError: true,
		whitelist: true,
	}));

	// Convert TypeORM not found errors to 404s
	app.useGlobalFilters(new EntityNotFoundExceptionFilter());

	// Convert objects into JSON responses
	app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector), {
		excludePrefixes: ['_'],
		exposeDefaultValues: true,
	}));

	// General configuration
	app.enableShutdownHooks();
	app.set('trust proxy', Environment.APP_TRUSTED_PROXY);

	// Start listening on the configured port
	await app.listen(getListeningPort());

	// Start the garbage collector if it's available
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
