import axios from "axios";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonStyle,
  ButtonBuilder,
  EmbedBuilder,
} from "discord.js";
import mediaConverter from "../../helpers/tools/mediaConverter";
import sendError from "../../helpers/utils/sendError";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const chartIdOption = interaction.options.getInteger("id", true);

      await interaction.editReply(
        `> <:colorsearch:1387268634380075069> [1/3] | Fetching chart information at */chart/${chartIdOption}`
      );

      // Get chart info
      const chartInfo = await axios
        .get(`https://api.phira.cn/chart/${chartIdOption}`)
        .then((res) => res.data)
        .catch((err) => {
          throw {
            name: err.response.statusText,
            message: err.response.data.error,
          };
        });

      await interaction.editReply(
        `> <:colorsearch:1387268634380075069> [2/3] | Fetching uploader information at */user/${chartInfo.uploader}`
      );

      // Get uploader info
      const uploaderInfo = await axios
        .get(`https://api.phira.cn/user/${chartInfo.uploader}`)
        .then((res) => res.data)
        .catch((err) => {
          throw {
            name: err.response.statusText,
            message: err.response.data.error,
          };
        });

      await interaction.editReply(
        "> <:colorfile:1387268836977410181> [3/3] | Converting some file.."
      );

      // Convert illustration file to png
      const chartIllustration = await mediaConverter({
        url: chartInfo.illustration as string,
        format: "png",
      });

      // Some button for direct link to download chart,...
      const functionButtons = [
        new ButtonBuilder()
          .setLabel("Download")
          .setEmoji("1388725502050697348")
          .setStyle(ButtonStyle.Link)
          .setURL(chartInfo.file as string),
        new ButtonBuilder()
          .setLabel("Beatmap")
          .setEmoji("1388725940368052286")
          .setStyle(ButtonStyle.Link)
          .setURL(`https://phira.moe/chart/${chartInfo.id}`),
        new ButtonBuilder()
          .setLabel("Uploader")
          .setEmoji("1387288588798005248")
          .setStyle(ButtonStyle.Link)
          .setURL(`https://phira.moe/user/${uploaderInfo.id}`),
      ];

      const functionButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        functionButtons
      );

      // Send embed
      interaction.editReply({
        content: null,
        embeds: [
          new EmbedBuilder()
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
            .setImage(`attachment://${chartIllustration?.name}`)
            .setColor("Aqua")
            .setFooter({
              text: `Uploaded by: ${uploaderInfo.name} (Followers: ${uploaderInfo.follower_count})`,
            })
            .setTimestamp(),
        ],
        components: [functionButtonRow],
        files: [chartIllustration!],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "phira-chart",
  description: "Fetch chart information from API to download",
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "id",
      description: "Enter your id chart",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  cooldown: 10,
  useInDm: true,
  requiredVoiceChannel: false,
};

export default command;
