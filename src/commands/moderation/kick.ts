import { ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import type { MyClient } from '../../client';
import { Command } from '../../structures/Command';
import { CommandCategory, CommandName } from '../../types';

export default class Kick extends Command {
	// **Constructor:** Sets up command properties and permission requirements
	public constructor(client: MyClient) {
		super(client, {
			name: CommandName.Kick,
			description: 'Kicks a user from the server.',
			category: CommandCategory.Moderation,
			// Require necessary permissions for the command to execute
			permissions: [PermissionsBitField.Flags.KickMembers],
		});

		this.data.addUserOption((option) =>
			option.setName('member').setDescription('The member to kick.')
		);
	}

	// **Execute method:** Handles command execution
	public async execute(
		interaction: ChatInputCommandInteraction
	): Promise<void> {
		// Check if the user has the 'KICK_MEMBERS' permission
		if (
			!interaction.memberPermissions?.has(
				PermissionsBitField.Flags.KickMembers
			)
		) {
			await interaction.reply({
				content: "❌ You don't have permission to use this command.",
				ephemeral: true, // Make the reply only visible for command user
			});
			return;
		}

		// Get the target user from the first mentioned user
		const targetUser = interaction.options.getUser('user', true); // Required argument

		// Get the target user as a GuildMember
		const targetMember = interaction.guild?.members.cache.get(targetUser.id);

		// Get the reason provided by the user (optional)
		const reason = interaction.options.getString('reason');

		if (!targetMember) {
			await interaction.reply({
				content: '❌ The user is not in this server.',
				ephemeral: true, // Make the reply only visible for command user
			});
			return;
		}

		// Check if the target user is the bot itself or the interaction author
		if (
			targetMember.id === interaction.client.user?.id ||
			targetMember.id === interaction.user.id
		) {
			await interaction.reply({
				content: '❌ You cannot kick yourself or the bot.',
				ephemeral: true,
			});
			return;
		}

		// Try kicking the target user
		try {
			await targetMember.kick(reason ?? 'No reason provided.');
			await interaction.reply({
				content: `✅ Successfully kicked ${targetUser.username}.`,
			});

			// Optionally, send a DM to the kicked user with the reason (if provided)
			if (reason) {
				try {
					await targetUser.send(
						`You were kicked from ${interaction.guild?.name} for: ${reason}`
					);
				} catch (error) {
					console.error('Failed to send DM to kicked user:', error);
				}
			}
		} catch (error) {
			console.error('Error kicking user:', error);
			await interaction.reply({
				content: '❌ An error occurred while trying to kick the user.',
				ephemeral: true,
			});
		}
	}
}
