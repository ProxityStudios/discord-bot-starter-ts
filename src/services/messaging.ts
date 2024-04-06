import { ColorResolvable, EmbedBuilder } from 'discord.js';
import { Service } from './Service';

export class MessagingService extends Service {
	public async init(): Promise<true | Error> {
		this.client.logger.info('Messaging service done.');
		return Promise.resolve(true);
	}

	private createEmbed(
		color: ColorResolvable,
		message: string,
		title?: string
	): EmbedBuilder {
		return new EmbedBuilder()
			.setColor(color)
			.setDescription(message)
			.setTitle(title ?? null);
	}

	public infoEmbed(message: string, title?: string): EmbedBuilder {
		return this.createEmbed('Blue', message, title);
	}

	public warnEmbed(message: string, title?: string): EmbedBuilder {
		return this.createEmbed('Yellow', message, title);
	}

	public errorEmbed(message: string, title?: string): EmbedBuilder {
		return this.createEmbed('Red', message, title);
	}
}
