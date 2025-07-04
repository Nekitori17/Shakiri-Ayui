import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import sendError from "../../helpers/utils/sendError";
import { CommandInterface } from "./../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const targetUserOption = interaction.options.getUser("user");
      const targetUser = await interaction.guild?.members.fetch(
        targetUserOption?.id || interaction.user.id
      );

      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: interaction.user.displayName,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle("🙍‍♂️ User Information")
            .setDescription(
              `* **Display name**: ${targetUser?.displayName}` +
                "\n" +
                `* **Username**: ${targetUser?.user.username}` +
                "\n" +
                `* **Type**: ${targetUser?.user.bot ? "Bot" : "User"}` +
                "\n" +
                `* **Joined Discord**: <t:${
                  targetUser?.user.createdTimestamp || 0 / 1000
                }:F>` +
                "\n" +
                `* **Joined Server**: <t:${
                  targetUser?.joinedTimestamp || 0 / 1000
                }:F>` +
                "\n" +
                `* **Avatar**: [View](${targetUser?.displayAvatarURL({
                  extension: "png",
                  forceStatic: true,
                })})` +
                "\n" +
                `* **Subscription**: ${
                  targetUser?.premiumSinceTimestamp
                    ? "<t:" + targetUser.premiumSinceTimestamp / 1000 + ":F>"
                    : "None"
                }` +
                "\n" +
                `* **Hightest Role**: ${targetUser?.roles.highest}`
            )
            .setThumbnail(targetUser?.displayAvatarURL() || null)
            .setFields([
              {
                name: "Roles",
                value: `${targetUser?.roles.cache
                  .values()
                  .toArray()
                  .slice(0, 10)
                  .join(" ")}${
                  targetUser && targetUser?.roles.cache.size > 10
                    ? `... +${targetUser?.roles.cache.size - 10}`
                    : ""
                }`,
                inline: false,
              },
            ])
            .setFooter({
              text: `User ID: ${targetUser?.id}`,
            })
            .setTimestamp()
            .setColor("#00f2ff"),
        ],
      });

      return true;
    } catch (error) {
      sendError(interaction, error);

      return false;
    }
  },
  name: "user-info",
  description: "Get info about a user in the server",
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "user",
      description: "Chose the user or yourself if not set",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  useInDm: false,
  requiredVoiceChannel: false,
};

export default command;
