import { DynamicModule, Provider } from '@nestjs/common';
import { TypeOrmModuleOptions, getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CustomRepositoryConstructor, TYPEORM_EX_CUSTOM_REPOSITORY } from '../typeorm/decorators/CustomRepository';

export class CustomRepositoriesModule {

	public static forRoot(config: TypeOrmOptions): DynamicModule {
		const providers: Provider[] = [];

		for (const repository of config.repositories) {
			const entity = Reflect.getMetadata(TYPEORM_EX_CUSTOM_REPOSITORY, repository);

			if (!entity) {
				continue;
			}

			providers.push({
				inject: [getDataSourceToken()],
				provide: repository,
				useFactory: (dataSource: DataSource) => {
					const baseRepository = dataSource.getRepository<any>(entity);
					return new repository(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
				},
			});
		}

		return {
			exports: providers,
			module: CustomRepositoriesModule,
			controllers: [],
			providers,
			global: true
		};
	}

}

/**
 * The TypeORM configuration object with an added `repositories` property.
 */
export type TypeOrmOptions = TypeOrmModuleOptions & {

	/**
	 * The list of custom repositories to be loaded by TypeORM.
	 */
	repositories: CustomRepositoryConstructor[];

}
