// Import necessary modules
import { ChatInputCommandInteraction } from 'discord.js';
import { MyClient } from '../../client';
import { Command } from '../../structures/Command';
import { CommandCategory, CommandName } from '../../types';

// Define the command class
export default class EchoCommand extends Command {
	// **Constructor:** Sets up command properties and options
	public constructor(client: MyClient) {
		super(client, {
			name: CommandName.Echo, // Command name as it will appear in Discord
			description: 'Repeats what you tell it.', // Explanation of what the command does
			category: CommandCategory.General, // Category for command
		});

		// Add a required string option named 'message' for clarity
		this.data.addStringOption((option) =>
			option
				.setName('message')
				.setDescription('The message to echo back.')
				.setRequired(true)
		);
	}

	// **Execute method:** Handles command execution
	public async execute(
		interaction: ChatInputCommandInteraction
	): Promise<void> {
		// Retrieve the 'message' option value from the user's command
		const message = interaction.options.getString('message', true);

		// Respond with a clear and concise message
		await interaction.reply(`Here's what you said: ${message}`);
	}
}
