import { EntitySchema, MixedList } from 'typeorm';
import { CustomRepositoryConstructor, TYPEORM_EX_CUSTOM_REPOSITORY } from '../decorators/CustomRepository';
import { ReflectionClass } from '@baileyherbert/reflection';

/**
 * Returns an array of entities derived from the given list of custom repositories.
 *
 * @param repositories
 * @returns
 */
export function getEntitiesFromCustomRepositories(repositories: CustomRepositoryConstructor[]) {
	const entities: MixedList<string | Function | EntitySchema<any>> = [];

	for (const repository of repositories) {
		const ref = new ReflectionClass(repository);
		const target = ref.getMetadata(TYPEORM_EX_CUSTOM_REPOSITORY);

		entities.push(target);
	}

	return entities;
}
