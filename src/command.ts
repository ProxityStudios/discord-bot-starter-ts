import {
  APIInteractionGuildMember,
  ChatInputCommandInteraction,
  Guild,
  GuildMember,
  SlashCommandBuilder,
  TextChannel,
  User,
} from "discord.js";
import { CustomClient } from "./client";
import { CommandCategory, CommandName } from "./types";
import { MessagingService } from "./services/messaging";
import { CommandsService } from "./services/commands";

export interface CommandOptions {
  name: CommandName;
  description: string;
  category: CommandCategory;
}

export interface CommandContext {
  messaging: MessagingService;
  commands: CommandsService;
  member: GuildMember | APIInteractionGuildMember;
  channel: TextChannel;
  guild: Guild;
  user: User;
}

export abstract class Command {
  public client: CustomClient;

  public name: CommandName;
  public description: string;
  public category: CommandCategory;
  public data: SlashCommandBuilder;

  public constructor(client: CustomClient, props: CommandOptions) {
    this.client = client;
    this.name = props.name;
    this.description = props.description;
    this.category = props.category;
    this.data = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);
  }

  public abstract execute(
    interaction: ChatInputCommandInteraction,
    ctx: CommandContext
  ): Promise<void>;
}
