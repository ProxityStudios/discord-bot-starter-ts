import {
	ChatInputApplicationCommandData,
	Events,
	GuildChannel,
	Interaction,
	REST,
	Routes,
	TextChannel,
} from 'discord.js';
import fs from 'fs/promises';
import path from 'path';
import { Command } from '../structures/Command';
import { Service } from './Service';
import type { MyClient } from '../client';

interface ModuleType<T> {
	default: new (client: MyClient) => T;
}

export class CommandsService extends Service {
	public commands: Command[] = [];

	public cmdMap = new Map<string, Command>();

	public async init(): Promise<true | Error> {
		await this.loadCommands(path.join(__dirname, '../commands'));
		await this.registerCommands();

		this.client.on(Events.ClientReady, () => {
			this.client.on(
				Events.InteractionCreate,
				this.onInteractionCreate.bind(this)
			);
		});
		this.client.logger.info(`Commands service done`);
		return true;
	}

	private async loadCommands(dir: string): Promise<void> {
		const commandFiles = await fs.readdir(dir);

		await Promise.all(
			commandFiles.map(async (commandFile) => {
				const filePath = path.join(dir, commandFile);
				const stat = await fs.stat(filePath);

				if (stat.isDirectory()) {
					await this.loadCommands(filePath);
				} else if (
					commandFile.endsWith('.ts') ||
					commandFile.endsWith('.js')
				) {
					const CommandModule = (await import(
						filePath
					)) as ModuleType<Command>;

					if (
						CommandModule.default &&
						CommandModule.default.prototype instanceof Command
					) {
						const CommandConstructor = CommandModule.default;
						const command = new CommandConstructor(this.client);
						this.commands.push(command);
						this.cmdMap.set(command.name.toLowerCase(), command);
						this.client.logger.info(
							`Loaded command ${command.name} from ${path.relative(
								process.cwd(),
								filePath
							)}`
						);
					} else {
						this.client.logger.warn(
							`The command at ${filePath} is not an instance of the Command class.`
						);
					}
				}
			})
		);
	}

	private async registerCommands() {
		const rest = new REST().setToken(process.env.TOKEN!);

		try {
			this.client.logger.info(
				`Refreshing ${this.commands.length} application (/) commands.`
			);

			const data = (await rest.put(
				Routes.applicationGuildCommands(
					process.env.CLIENT_ID!,
					process.env.GUILD_ID!
				),
				{ body: this.commands.map((command) => command.data.toJSON()) }
			)) as ChatInputApplicationCommandData[];

			this.client.logger.info(
				`Reloaded ${data.length} application (/) commands.`
			);
		} catch (error) {
			this.client.logger.error(error);
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
			this.client.logger.error(
				"Interaction doesn't have a valid channel or guild."
			);
			return;
		}

		// Get the member from the interaction or fetch it from the guild
		const member =
			interaction.member ?? (await guild.members.fetch(interaction.user.id));
		if (!member) {
			this.client.logger.error(
				`Could not get ${interaction.member?.user.id} for ${guild.id}`
			);
			return;
		}

		// Execute the command
		try {
			await cmd.execute(interaction, {
				services: this.client.services,
				commands: this,
				member,
				channel: channel as TextChannel,
				guild,
				user: interaction.user,
			});
		} catch (error) {
			this.client.logger.error(error);
			await interaction.reply({
				content: 'An error occurred while executing the command.',
			});
		}
	}
}
