import { SetMetadata } from '@nestjs/common';
import { Repository } from 'typeorm';

export const TYPEORM_EX_CUSTOM_REPOSITORY = Symbol();

/**
 * Marks a class as a custom repository for an entity.
 *
 * @param entity
 * @returns
 */
export function CustomRepository(entity: Function): ClassDecorator {
	return SetMetadata(TYPEORM_EX_CUSTOM_REPOSITORY, entity);
}

/**
 * A custom repository constructor.
 */
export type CustomRepositoryConstructor = new (...args: any[]) => Repository<any>;
