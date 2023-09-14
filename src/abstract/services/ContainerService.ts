import { Injectable } from '@nestjs/common';
import { Service } from '../architecture/Service';
import { DiscoveryService, ModulesContainer } from '@nestjs/core';
import { container } from '@baileyherbert/container';
import { Nest } from '../globals/Nest';

@Injectable()
export class ContainerService extends Service {

	public constructor(
		private readonly modulesContainer: ModulesContainer
	) { super() }

	protected override async onModuleInit() {
		// Get a discovery service instance from our nest container
		const discovery = new DiscoveryService(this.modulesContainer);

		// Register all providers in the application
		for (const provider of discovery.getProviders()) {
			if (typeof provider.token === 'function') {
				container.register(provider.token, { useFactory: () => Nest.app.get(provider.token) });
			}
		}
	}

}

