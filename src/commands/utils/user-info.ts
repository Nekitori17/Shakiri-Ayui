import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { CommandInterface } from "./../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const user = interaction.options.get("user")?.value as string;
    const userObject = await interaction.guild?.members.fetch(
      user || interaction.user.id
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
            `* **Display name**: ${userObject?.displayName}` +
              "\n" +
              `* **Username**: ${userObject?.user.username}` +
              "\n" +
              `* **Type**: ${userObject?.user.bot ? "Bot" : "User"}` +
              "\n" +
              `* **Joined Discord**: <t:${
                userObject?.user.createdTimestamp || 0 / 1000
              }:F>` +
              "\n" +
              `* **Joined Server**: <t:${
                userObject?.joinedTimestamp || 0 / 1000
              }:F>` +
              "\n" +
              `* **Avatar**: [View](${userObject?.displayAvatarURL({
                extension: "png",
                forceStatic: true,
              })})` +
              "\n" +
              `* **Subscription**: ${
                userObject?.premiumSinceTimestamp
                  ? "<t:" + userObject.premiumSinceTimestamp / 1000 + ":F>"
                  : "None"
              }` +
              "\n" +
              `* **Hightest Role**: ${userObject?.roles.highest}`
          )
          .setThumbnail(userObject?.displayAvatarURL() || null)
          .setFooter({
            text: `User ID: ${userObject?.id}`,
          })
          .setTimestamp()
          .setColor("#00f2ff"),
      ],
    });
  },
  name: "user-info",
  description: "Get info about a user in the server",
  deleted: false,
  options: [
    {
      name: "user",
      description: "Chose the user or yourself if not set",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
};

export default command;
