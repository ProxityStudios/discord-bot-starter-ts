import { Client, Events, GatewayIntentBits } from 'discord.js';
import { MessagingService } from './services/messaging';
import { CommandsService } from './services/commands';
import type { Services } from './types';
import { Service } from './services/service';

export class MyClient extends Client {
	public services: Services;

	public servicesArr: Service[];

	constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildMessages,
			],
		});

		this.services = {
			messaging: new MessagingService(this),
			commands: new CommandsService(this),
		};
		this.servicesArr = Object.values(this.services);

		this.on(Events.ClientReady, (c) => this.onClientReady(c));
	}

	public async init() {
		try {
			const servicesPromises: Promise<true | Error>[] = [];

			this.servicesArr.forEach((s) => {
				servicesPromises.push(s.init());
			});

			console.log('Starting services');
			await Promise.all(servicesPromises);
			console.log('All services initialized successfully');
		} catch (error) {
			// TODO: improve error handling
			console.error(`error: Error starting services: ${error as any}`);
			throw error;
		}
	}

	private onClientReady(client: Client<true>) {
		console.log(`${client.user.tag} is now ready to serve.`);
	}
}
