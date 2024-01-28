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
import config from '../config';
import { Command } from '../command';
import { Service } from './service';

export class CommandsService extends Service {
	public commands: Command[] = [];

	public cmdMap = new Map<string, Command>();

	public async init(): Promise<true | Error> {
		await this.readCommands(path.join(__dirname, '../commands'));
		await this.registerCommands();

		this.client.on(Events.ClientReady, () => {
			this.client.on(
				Events.InteractionCreate,
				this.onInteractionCreate.bind(this)
			);
		});
		console.log(`Commands service done`);
		return true;
	}

	private async readCommands(dir: string): Promise<void> {
		const commandFiles = await fs.readdir(dir);

		await Promise.all(
			commandFiles.map(async (commandFile) => {
				const filePath = path.join(dir, commandFile);
				const stat = await fs.stat(filePath);

				if (stat.isDirectory()) {
					await this.readCommands(filePath);
				} else if (commandFile.endsWith('.ts')) {
					const CommandModule: any = await import(filePath);

					if (
						CommandModule?.default &&
						CommandModule.default.prototype instanceof Command
					) {
						// TODO: improve types
						// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, new-cap
						const command: Command = new CommandModule.default(
							this.client
						);
						this.commands.push(command);
						this.cmdMap.set(command.name.toLowerCase(), command);
						console.log(
							`Loaded command ${command.name}.ts from ${path.relative(
								process.cwd(),
								filePath
							)}`
						);
					} else {
						console.log(
							`error: The command at ${filePath} is not an instance of the Command class.`
						);
					}
				}
			})
		);
	}

	private async registerCommands() {
		const rest = new REST().setToken(config.token);

		try {
			console.log(
				`Refreshing ${this.commands.length} application (/) commands.`
			);

			const data = (await rest.put(
				Routes.applicationGuildCommands(
					config.applicationID,
					config.guildID
				),
				{ body: this.commands.map((command) => command.data.toJSON()) }
			)) as ChatInputApplicationCommandData[];

			console.log(`Reloaded ${data.length} application (/) commands.`);
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
			interaction.member ?? (await guild.members.fetch(interaction.user.id));
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
