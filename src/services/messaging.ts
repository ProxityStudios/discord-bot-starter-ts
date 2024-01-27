import { EmbedBuilder } from "discord.js";
import { Service } from "./service";

export class MessagingService extends Service {
  public async init(): Promise<void> {
    return Promise.resolve();
  }

  public infoEmbed(message: string): EmbedBuilder {
    const embed = new EmbedBuilder();
    embed.setColor("Blue");
    embed.setDescription(message);
    return embed;
  }

  public warnEmbed(message: string): EmbedBuilder {
    const embed = new EmbedBuilder();
    embed.setColor("Yellow");
    embed.setDescription(message);
    return embed;
  }

  public errorEmbed(message: string): EmbedBuilder {
    const embed = new EmbedBuilder();
    embed.setColor("Red");
    embed.setDescription(message);
    return embed;
  }
}
