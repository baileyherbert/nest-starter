import { DataSource } from 'typeorm';
import { Environment } from './abstract/environment';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { CustomRepositoryConstructor } from './abstract/typeorm/decorators/CustomRepository';
import { getEntitiesFromCustomRepositories } from './abstract/typeorm/helpers/entities';
import { TypeOrmOptions } from './abstract/modules/CustomRepositoriesModule';

/**
 * A list of custom repositories to be loaded by TypeORM.
 */
const repositories: Array<CustomRepositoryConstructor> = [
	// Put your custom repositories here
];

/**
 * The TypeORM configuration object.
 */
export const config: TypeOrmOptions = {
	type: 'mysql',
	host: Environment.DATABASE_HOST,
	port: Environment.DATABASE_PORT,
	username: Environment.DATABASE_USERNAME,
	password: Environment.DATABASE_PASSWORD,
	database: Environment.DATABASE_NAME + (process.env.IS_TYEPEORM_SCRIPT ? '_staging' : ''),
	entities: getEntitiesFromCustomRepositories(repositories),
	repositories,
	migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
	migrationsRun: Environment.NODE_ENV === 'production',
	synchronize: Environment.NODE_ENV !== 'production',
	charset: 'utf8mb4_unicode_ci',
	timezone: 'Z',
	namingStrategy: new SnakeNamingStrategy(),
}

/**
 * The TypeORM data source.
 */
export const AppDataSource = new DataSource(config as any);
