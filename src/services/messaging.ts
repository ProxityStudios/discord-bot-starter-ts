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

  public progressBar(percent: number) {
    const left = "🟩";
    const middle = "🟩";
    const right = "🟩";
    const empty = "⬜";

    const total = 10;
    const filled = Math.round((percent / 100) * total);
    const remaining = total - filled;

    let progressBar = "";

    if (filled > 0) {
      progressBar += left;
    }

    for (let i = 1; i < filled - 1; i++) {
      progressBar += middle;
    }

    if (filled > 1) {
      progressBar += right;
    }

    for (let i = 0; i < remaining; i++) {
      progressBar += empty;
    }

    return progressBar;
  }
}
