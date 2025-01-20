import axios from "axios";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonStyle,
  ButtonBuilder,
  EmbedBuilder,
} from "discord.js";
import mediaConverter from "../../helpers/mediaConverter";
import { sendError } from "../../utils/sendError";
import { CommandInterface } from "../../types/InteractionInterfaces";
import { ButtonComponentInterface } from "../../types/ActionComponentInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const idChart = interaction.options.get("id")?.value as number;

    try {
      await interaction.editReply(
        `> 🔎 [1/3] | Fetching chart information at */chart/${idChart}`
      );

      const chartInfo = await axios
        .get(`https://api.phira.cn/chart/${idChart}`)
        .then((res) => res.data)
        .catch((err) => {
          throw {
            name: err.response.statusText,
            message: err.response.data.error,
          };
        });

      await interaction.editReply(
        `> 🔎 [2/3] | Fetching uploader information at */user/${chartInfo.uploader}`
      );

      const uploaderInfo = await axios
        .get(`https://api.phira.cn/user/${chartInfo.uploader}`)
        .then((res) => res.data)
        .catch((err) => {
          throw {
            name: err.response.statusText,
            message: err.response.data.error,
          };
        });

      await interaction.editReply("🔀 [3/3] | Converting some file..");

      const illustration = await mediaConverter({
        url: (chartInfo.illustration as string).replace(
          "api.phira.cn/files",
          "files-cf.phira.cn"
        ),
        format: "png",
      });

      const embedChartInfo = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.displayName,
          iconURL: interaction.user.avatarURL() as string,
        })
        .setTitle(`> __${chartInfo.composer}__ - ${chartInfo.name}`)
        .setDescription(
          `* **Level**: ${chartInfo.level}\n` +
            `* **Charter**: ${chartInfo.charter}\n` +
            `* **Rating**: ${((chartInfo.rating / 2) * 10).toFixed(2)} (${
              chartInfo.ratingCount
            } Users)\n` +
            `* **Description**: ${chartInfo.description}\n` +
            `* **Ranked**: ${chartInfo.ranked ? "Yes" : "No"}\n` +
            `* **Review**: ${chartInfo.reviewed ? "Yes" : "No"}\n` +
            `* **Stable**: ${chartInfo.stable ? "Yes" : "No"}\n`
        )
        .setThumbnail(
          "https://raw.githubusercontent.com/TeamFlos/phira/main/assets/icon.png"
        )
        .setImage(`attachment://${illustration?.name}`)
        .setColor("Aqua")
        .setFooter({
          text: `Uploaded by: ${uploaderInfo.name} (Followers: ${uploaderInfo.follower_count})`,
        })
        .setTimestamp();

      const buttons: ButtonComponentInterface[] = [
        {
          label: "Download",
          style: ButtonStyle.Link,
          emoji: "📥",
          url: (chartInfo.file as string).replace(
            "api.phira.cn/files",
            "files-cf.phira.cn"
          ),
        },
        {
          label: "Beatmap",
          style: ButtonStyle.Link,
          emoji: "🗺️",
          url: `https://phira.moe/chart/${chartInfo.id}`,
        },
        {
          label: "Uploader",
          style: ButtonStyle.Link,
          emoji: "👤",
          url: `https://phira.moe/user/${uploaderInfo.id}`,
        },
      ];

      const buttonRow = buttons.map((button) =>
        new ButtonBuilder()
          .setLabel(button.label as string)
          .setEmoji(button.emoji as string)
          .setStyle(button.style as ButtonStyle)
          .setURL(button.url as string)
      );

      const row = new ActionRowBuilder().addComponents(buttonRow);

      interaction.editReply({
        content: null,
        embeds: [embedChartInfo],
        components: [row as any],
        files: [illustration!],
      });
    } catch (error) {
      sendError(interaction, error)
    }
  },
  name: "phira-chart",
  description: "Fetch chart information from API to download",
  deleted: false,
  canUseInDm: true,
  options: [
    {
      name: "id",
      description: "Enter your id chart",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
};

export default command;
