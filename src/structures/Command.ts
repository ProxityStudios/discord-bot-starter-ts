import {
	APIInteractionGuildMember,
	ChatInputCommandInteraction,
	Guild,
	GuildMember,
	PermissionResolvable,
	SlashCommandBuilder,
	TextChannel,
	User,
} from 'discord.js';
import type { MyClient } from '../client';
import { CommandCategory, CommandName, Services } from '../types';
import type { CommandsService } from '../services/Commands';

export interface CommandOptions {
	name: CommandName;
	description: string;
	category: CommandCategory;
	permissions?: PermissionResolvable[];
}

export interface CommandContext {
	services: Services;
	commands: CommandsService;
	member: GuildMember | APIInteractionGuildMember;
	channel: TextChannel;
	guild: Guild;
	user: User;
}

export abstract class Command {
	public client: MyClient;

	public name: CommandName;

	public description: string;

	public category: CommandCategory;

	public data: SlashCommandBuilder;

	public permissions?: PermissionResolvable[];

	public constructor(client: MyClient, props: CommandOptions) {
		this.client = client;

		this.name = props.name;
		this.description = props.description;
		this.category = props.category;
		this.permissions = props.permissions;
		this.data = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description);
	}

	public abstract execute(
		interaction: ChatInputCommandInteraction,
		ctx: CommandContext
	): Promise<void>;
}
