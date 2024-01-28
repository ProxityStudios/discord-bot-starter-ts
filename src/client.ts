import { Client, Events, GatewayIntentBits } from 'discord.js';
import { ILogObj, Logger } from 'tslog';
import { MessagingService } from './services/messaging';
import { CommandsService } from './services/commands';
import { Services } from './types';
import { Service } from './services/service';

export class MyClient extends Client {
	public services: Services;

	public servicesArr: Service[];

	public logger: Logger<ILogObj>;

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

		this.logger = new Logger({
			type: 'pretty',
			prettyLogTemplate: '{{MM}}:{{ss}} {{logLevelName}} ',
		});

		this.on(Events.ClientReady, (c) => this.onClientReady(c));
	}

	public async init() {
		try {
			const servicesPromises: Promise<true | Error>[] = [];

			this.servicesArr.forEach((s) => {
				servicesPromises.push(s.init());
			});

			this.logger.info('Starting services');
			await Promise.all(servicesPromises);
			this.logger.info('All services initialized successfully');
		} catch (error) {
			// TODO: improve error handling
			this.logger.error(`error: Error starting services: ${error as any}`);
			throw error;
		}
	}

	private onClientReady(client: Client<true>) {
		this.logger.info(`${client.user.tag} is now ready to serve.`);
	}
}
