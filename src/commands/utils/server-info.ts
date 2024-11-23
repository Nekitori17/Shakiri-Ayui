import { Client, CommandInteraction, EmbedBuilder } from "discord.js";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction: CommandInteraction, client: Client) {
    await interaction.deferReply();

    interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: interaction.user.displayName,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTitle("👪 Server Information")
          .setDescription(
            `* **Name**: ${interaction.guild?.name}` +
              "\n" +
              `* **Description**: ${
                interaction.guild?.description || "No description"
              }` +
              "\n" +
              `* **Boost Level**: ${interaction.guild?.premiumTier}/4 (${
                interaction.guild?.premiumSubscriptionCount || 0
              }/14 boosts)` +
              "\n" +
              `* **Owner**: ${await interaction.guild?.fetchOwner()}` +
              "\n" +
              `* **Members**: ${interaction.guild?.memberCount}` +
              "\n" +
              `* **Roles**: ${interaction.guild?.roles.cache.size} | **Channels**: ${interaction.guild?.channels.cache.size}` +
              "\n" +
              `* **Emo**: ${interaction.guild?.emojis.cache.size} emojis | ${interaction.guild?.stickers.cache.size} stickers` +
              "\n" +
              `* **Created at**: <t:${
                interaction.guild?.createdTimestamp || 0 / 1000
              }:F>` +
              "\n" +
              `* **Verification level**: ${interaction.guild?.verificationLevel}` +
              "\n" +
              `* **Verified**: ${interaction.guild?.verified ? "✅" : "❌"}` +
              "\n" +
              `* **Vanity URL**: ${interaction.guild?.vanityURLCode || "None"}`
          )
          .setThumbnail(interaction.guild?.iconURL() || null)
          .setFields([
            {
              name: "Server Icon",
              value: `[Icon](${interaction.guild?.iconURL({
                extension: "png",
                forceStatic: true,
              })})`,
            },
            {
              name: "Futures",
              value: `${interaction.guild?.features
                .map((f) => f[0] + f.slice(1).toLowerCase().replace(/_/g, " "))
                .join(", ")}`,
              inline: true,
            },
          ])
          .setFooter({
            text: `Server ID: ${interaction.guild?.id}`,
          })
          .setTimestamp()
          .setColor("#00f2ff"),
      ],
    });
  },
  name: "server-info",
  description: "Get info about the server",
  deleted: false,
};

export default command;
