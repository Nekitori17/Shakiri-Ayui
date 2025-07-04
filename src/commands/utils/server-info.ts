import _ from "lodash";
import { EmbedBuilder } from "discord.js";
import sendError from "../../helpers/utils/sendError";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
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
                `* **Vanity URL**: ${
                  interaction.guild?.vanityURLCode || "None"
                }`
            )
            .setThumbnail(interaction.guild?.iconURL() || null)
            .setFields([
              {
                name: "Server Icon",
                value: `[Icon](${interaction.guild?.iconURL({
                  extension: "png",
                  forceStatic: false,
                })})`,
              },
              {
                name: "Futures",
                value: `${interaction.guild?.features
                  .slice(0, 10)
                  .map((f) => `\`${_.capitalize(_.startCase(_.toLower(f)))}\``)
                  .join(", ")}${
                  interaction.guild && interaction.guild?.features.length > 10
                    ? `... +${interaction.guild?.features.length - 10}`
                    : ""
                }`,
                inline: false,
              },
              {
                name: "Roles",
                value: `${interaction.guild?.roles.cache
                  .values()
                  .toArray()
                  .slice(0, 15)
                  .join(" ")}${
                  interaction.guild && interaction.guild?.roles.cache.size > 15
                    ? `... +${interaction.guild?.roles.cache.size - 15}`
                    : ""
                }`,
                inline: false,
              },
              {
                name: "Emojis",
                value: `${interaction.guild?.emojis.cache
                  .values()
                  .toArray()
                  .slice(0, 15)
                  .join("")}${
                  interaction.guild && interaction.guild?.emojis.cache.size > 15
                    ? `... +${interaction.guild?.emojis.cache.size - 15}`
                    : ""
                }`,
                inline: false,
              },
            ])
            .setFooter({
              text: `Server ID: ${interaction.guild?.id}`,
            })
            .setTimestamp()
            .setColor("#00f2ff"),
        ],
      });

      return true;
    } catch (error) {
      sendError(interaction, error);

      false
    }
  },
  name: "server-info",
  description: "Get info about the server",
  deleted: false,
  devOnly: false,
  useInDm: false,
  requiredVoiceChannel: false,
};

export default command;
