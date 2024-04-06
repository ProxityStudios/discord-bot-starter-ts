// Import necessary modules
import { ChatInputCommandInteraction } from 'discord.js';
import type { MyClient } from '../../client';
import { Command, CommandContext } from '../../structures/Command';
import { CommandCategory, CommandName } from '../../types';

// Define the command class
export default class HelpCommand extends Command {
	// **Constructor:** Sets up command properties and options
	public constructor(client: MyClient) {
		super(client, {
			name: CommandName.Help, // Command name as it will appear in Discord
			description: 'Shows available commands.', // Explanation of what the command does
			category: CommandCategory.General, // Category for command
		});
	}

	// **Execute method:** Handles command execution
	public async execute(
		interaction: ChatInputCommandInteraction,
		ctx: CommandContext // Access to command context
	): Promise<void> {
		// Create an informative embed with a title
		const embed = ctx.services.messaging.infoEmbed('Available Commands');

		// Get all registered commands and sort alphabetically
		const commands = ctx.commands.commands.sort((a, b) =>
			a.name.localeCompare(b.name)
		);

		// Group commands by category and add to embed fields
		const commandCategories = Object.values(CommandCategory);
		commandCategories.forEach((commandCategory) => {
			const categoryCommands = commands.filter(
				(c) => c.category === commandCategory
			);
			if (categoryCommands.length > 0) {
				const commandList = categoryCommands.map((c) => c.name).join(', ');
				embed.addFields({ name: commandCategory, value: commandList }); // Create fields for each category
			}
		});

		// Reply with the informative embed
		await interaction.reply({ embeds: [embed] });
	}
}
