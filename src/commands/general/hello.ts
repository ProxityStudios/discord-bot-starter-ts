import { ChatInputCommandInteraction } from 'discord.js';
import { CustomClient } from '../../client';
import { Command } from '../../command';
import { CommandCategory, CommandName } from '../../types';

export default class extends Command {
	public constructor(client: CustomClient) {
		super(client, {
			name: CommandName.Hello,
			description: 'Greets the user.',
			category: CommandCategory.General,
		});
	}

	public async execute(
		interaction: ChatInputCommandInteraction
	): Promise<void> {
		await interaction.reply({
			content: `Hey there, ${interaction.user.username}!`,
		});
	}
}
