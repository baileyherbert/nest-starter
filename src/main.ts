import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { CustomLogger } from './abstract/logger';
import { configure } from './abstract/configure';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		logger: new CustomLogger(),
		forceCloseConnections: true
	});

	await configure(app);
}

bootstrap();
