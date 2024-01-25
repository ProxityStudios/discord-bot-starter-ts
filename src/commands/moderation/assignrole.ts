import {
  Role,
  GuildMember,
  EmbedBuilder,
  Message,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command, CommandContext } from "../../command";
import { CustomClient } from "../../client";
import { CommandCategory, CommandName } from "../../types";

export default class extends Command {
  public constructor(client: CustomClient) {
    super(client, {
      name: CommandName.AssignRole,
      description: "Assigns a role to members in the server.",
      category: CommandCategory.Moderation,
    });

    this.data
      .addSubcommand((subcommand) =>
        subcommand
          .setName("all")
          .setDescription("Assigns a role to all members.")
          .addRoleOption((option) =>
            option
              .setName("role")
              .setDescription("The role to assign.")
              .setRequired(true)
          )
          .addBooleanOption((option) =>
            option
              .setName("include_bots")
              .setDescription("Whether to include bots or not.")
          )
          .addStringOption((option) =>
            option
              .setName("reason")
              .setDescription("The reason for the role assignment.")
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("role")
          .setDescription("Assigns a role to all members with a specific role.")
          .addRoleOption((option) =>
            option
              .setName("role")
              .setDescription("The role to assign.")
              .setRequired(true)
          )
          .addRoleOption((option) =>
            option
              .setName("target_role")
              .setDescription("The role to filter by.")
              .setRequired(true)
          )
          .addBooleanOption((option) =>
            option
              .setName("include_bots")
              .setDescription("Whether to include bots or not.")
          )
          .addStringOption((option) =>
            option
              .setName("reason")
              .setDescription("The reason for the role assignment.")
          )
      );
  }

  public async execute(
    interaction: ChatInputCommandInteraction,
    ctx: CommandContext
  ): Promise<void> {
    if (!interaction.guild) return;
    const subcommand = interaction.options.getSubcommand();
    const role = interaction.options.getRole("role") as Role;
    const members = await interaction.guild.members.fetch();
    const includeBots = interaction.options.getBoolean("include_bots") || false;
    const reason =
      interaction.options.getString("reason") || "No reason provided";

    let targetMembers = members.filter(
      (member) =>
        !member.roles.cache.has(role.id) &&
        member.manageable &&
        (includeBots || !member.user.bot)
    );
    let embedTitle: string;
    let embedDescription: string;

    switch (subcommand) {
      case "all":
        embedTitle = `Assigning role ${role.name} to all members`;
        embedDescription = `The role will be assigned to a total of ${targetMembers.size.toLocaleString()} members.\nPlease be patient, as this process may take some time.`;
        break;
      case "role":
        const targetRole = interaction.options.getRole("target_role") as Role;
        targetMembers = targetMembers.filter((member) =>
          member.roles.cache.has(targetRole.id)
        );
        embedTitle = `Assigning role ${role.name} to members with role ${targetRole.name}`;
        embedDescription = `The role will be assigned to a total of ${targetMembers.size.toLocaleString()} members who have the role ${
          targetRole.name
        }.\nPlease be patient, as this process may take some time.`;
        break;
      default:
        return;
    }

    let errorReason = "";
    if (!targetMembers) {
      await interaction.reply({
        content: `An unexpected error occurred while fetching the members.`,
        ephemeral: true,
      });
      return;
    }
    if (targetMembers.size === 0) {
      errorReason += "No members are eligible for the role assignment.\n";
    }
    if (
      !interaction.guild.members.me?.permissions.has(
        PermissionFlagsBits.ManageRoles
      )
    ) {
      errorReason += "The bot does not have the permission to manage roles.\n";
    }
    let botroles = interaction.guild?.members.me?.roles.highest
      ? interaction.guild.members.me.roles.highest.position
      : 0;
    if (role.position >= botroles) {
      errorReason +=
        "The bot cannot assign a role that is higher or equal to its own highest role.\n";
    }
    if (errorReason) {
      await interaction.reply({
        content: errorReason,
        ephemeral: true,
      });
      return;
    }

    let progressBar = ctx.messaging.progressBar(0);

    const embed = new EmbedBuilder()
      .setTitle(embedTitle)
      .setDescription(embedDescription)
      .addFields([
        { name: "Assigned", value: "0", inline: true },
        { name: "Errors", value: "0", inline: true },
        { name: "Skips", value: "0", inline: true },
        { name: "Estimated time", value: "Calculating...", inline: true },
        { name: "Elapsed time", value: "0 seconds" },
        { name: "Progress", value: `${progressBar} (0%)`, inline: true },
      ]);

    await interaction.reply({ embeds: [embed] });
    const message = (await interaction.fetchReply()) as Message;

    let assigned = 0;
    let errors = 0;
    let skips = 0;
    let percentage = 0;
    let startTime = Date.now();
    let elapsedTime = 0;
    let estimatedTime = 0;

    const updateEmbed = async () => {
      percentage = Math.round(
        ((assigned + errors + skips) / targetMembers!.size) * 100
      );
      elapsedTime = Math.round((Date.now() - startTime) / 1000);
      estimatedTime =
        Math.round((elapsedTime / percentage) * 100) - elapsedTime;
      progressBar = ctx.messaging.progressBar(percentage);

      if (embed.data.fields) {
        embed.data.fields[0].value = assigned.toString();
        embed.data.fields[1].value = errors.toString();
        embed.data.fields[2].value = skips.toString();
        embed.data.fields[3].value =
          estimatedTime > 0 ? `${estimatedTime} seconds` : "✅ Done";
        embed.data.fields[4].value = `${elapsedTime} seconds`;
        embed.data.fields[5].value = `${progressBar} (${percentage}%)`;
      }

      if (percentage === 100) {
        embed.setDescription("The role assignment is now complete.");
      }

      await message.edit({ embeds: [embed] });
    };

    const assignRole = async (member: GuildMember) => {
      try {
        if (member.manageable) {
          await member.roles.add(role, reason);
          assigned++;
        } else {
          skips++;
        }
      } catch (error) {
        errors++;
      }
    };

    let lastUpdateTime = Date.now();

    for (const member of targetMembers.values()) {
      await assignRole(member);
      await new Promise((resolve) => {
        setTimeout(resolve, 250);
      });

      if (Date.now() - lastUpdateTime >= 5000) {
        await updateEmbed();
        lastUpdateTime = Date.now();
      }
    }

    await updateEmbed();
  }
}
