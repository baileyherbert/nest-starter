import { Env } from '@baileyherbert/env';
import { LogLevel } from '@baileyherbert/logging';

export const Environment = Env.rules({

	/// =======================================================
	/// == General
	/// =======================================================

	NODE_ENV: Env.schema.enum(['development', 'production'] as const).optional('development'),

	/// =======================================================
	/// == Application
	/// =======================================================

	APP_SECRET: Env.schema.string(),
	APP_URL: Env.schema.string().optional('http://localhost:3000'),
	APP_PORT: Env.schema.number().optional(),
	APP_LOGGING_LEVEL: Env.schema.enum(LogLevel).optional(),
	APP_LOGGING_REQUESTS: Env.schema.boolean().optional(true),
	APP_TRUSTED_PROXY: (value?: string) => {
		if (typeof value === 'string') {
			value = value.trim().toLowerCase();

			if (value === 'true') return true;
			if (value === 'false') return false;
			if (value.match(/^\d+$/)) return Number(value);
			if (value.length === 0) return;

			return value;
		}
	},

	/// =======================================================
	/// == Database
	/// =======================================================

	DATABASE_TYPE: Env.schema.enum(['mysql', 'mariadb'] as const).optional('mysql'),
	DATABASE_HOST: Env.schema.string().optional('localhost'),
	DATABASE_PORT: Env.schema.number().optional(3306),
	DATABASE_USERNAME: Env.schema.string(),
	DATABASE_PASSWORD: Env.schema.string(),
	DATABASE_NAME: Env.schema.string(),

});
