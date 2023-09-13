import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Environment } from '../environment';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {

	private logger = new Logger('Http');

	use(request: Request, response: Response, next: NextFunction): void {
		if (Environment.APP_LOGGING_REQUESTS) {
			const { ip, method, originalUrl } = request;
			const start = Date.now();

			response.on('finish', () => {
				const { statusCode } = response;
				const took = Date.now() - start;
				const agent = request.get('user-agent') || '-';

				this.logger.verbose(
					`${ip} "${method} ${originalUrl}" "${agent}" ${statusCode} ${took}ms`
				);
			});
		}

		next();
	}
}
