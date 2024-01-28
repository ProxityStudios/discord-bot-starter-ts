import {
	ChatInputApplicationCommandData,
	Events,
	GuildChannel,
	Interaction,
	REST,
	Routes,
	TextChannel,
} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { Command } from '../command';
import { Service } from './service';
import config from '../../config.json';

export class CommandsService extends Service {
	public commands: Command[] = [];

	public cmdMap = new Map<string, Command>();

	public async init(): Promise<void> {
		await this.readCommands(path.join(__dirname, '../commands'));
		await this.registerCommands();

		return Promise.resolve();
	}

	public async onClientReady(): Promise<void> {
		this.client.on(
			Events.InteractionCreate,
			this.onInteractionCreate.bind(this)
		);

		// Subscribe to ClientReady event
		super.onClientReady();
	}

	private async readCommands(dir: string): Promise<void> {
		const files = fs.readdirSync(dir);

		for (const file of files) {
			const filePath = path.join(dir, file);
			const stat = fs.statSync(filePath);

			if (stat.isDirectory()) {
				await this.readCommands(filePath);
			} else if (file.endsWith('.ts')) {
				const commandModule = require(filePath);

				if (
					commandModule?.default &&
					commandModule.default.prototype instanceof Command
				) {
					const command: Command = new commandModule.default(this.client);
					this.commands.push(command);
					this.cmdMap.set(command.name.toLowerCase(), command);
					console.log(
						`\x1b[36minfo\x1b[0m: Loaded command \x1b[1m\x1b[34m${
							command.name
						}.ts\x1b[0m from \x1b[90m${path.relative(
							process.cwd(),
							filePath
						)}\x1b[0m`
					);
				} else {
					console.log(
						`error: The command at ${filePath} is not an instanse of the Command class.`
					);
				}
			}
		}
	}

	private async registerCommands() {
		const rest = new REST().setToken(config.token);

		try {
			console.log(
				`\x1b[36minfo\x1b[0m: Started refreshing ${this.commands.length} application (/) commands.`
			);

			const data = (await rest.put(
				Routes.applicationGuildCommands(config.userId, config.guildId),
				{ body: this.commands.map((command) => command.data.toJSON()) }
			)) as ChatInputApplicationCommandData[];

			console.log(
				`\x1b[36minfo\x1b[0m: Reloaded ${data.length} application (/) commands.`
			);
		} catch (error) {
			console.error(error);
		}
	}

	private async onInteractionCreate(interaction: Interaction): Promise<void> {
		// Check if the interaction is a chat input command
		if (!interaction.isChatInputCommand()) {
			return;
		}

		// Get the channel and guild from the interaction
		const { channel } = interaction;
		const guild = (channel as GuildChannel)?.guild;

		// Check if the command exists in the command map
		const cmd = this.cmdMap.get(interaction.commandName.toLowerCase());
		if (!cmd) {
			await interaction.reply({
				content: `No command matching ${interaction.commandName} was found.`,
			});
			return;
		}

		// Check if the interaction has a valid channel and guild
		if (!channel || !guild) {
			console.error("Interaction doesn't have a valid channel or guild.");
			return;
		}

		// Get the member from the interaction or fetch it from the guild
		const member =
			interaction.member || (await guild.members.fetch(interaction.user.id));
		if (!member) {
			console.error(
				`Could not get ${interaction.member?.user.id} for ${guild.id}`
			);
			return;
		}

		// Execute the command
		try {
			await cmd.execute(interaction, {
				messaging: this.client.services.messaging,
				commands: this,
				member,
				channel: channel as TextChannel,
				guild,
				user: interaction.user,
			});
		} catch (error) {
			console.error(error);
			await interaction.reply({
				content: 'An error occurred while executing the command.',
			});
		}
	}
}
