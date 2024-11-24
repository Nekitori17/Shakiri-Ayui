import {
  Client,
  CommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { CommandInterface } from "../../types/InteractionInterfaces";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";
import { useHistory } from "discord-player";

const command: CommandInterface = {
  async execute(interaction: CommandInteraction, client: Client) {
    await interaction.deferReply();

    try {
      const history = useHistory(interaction.guild?.id!);
      if (!history)
        throw {
          name: "No Queue",
          message: "There is no queue to play",
        };

      history.previous();
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: "🎶 The previous will start to play",
              iconURL: "https://img.icons8.com/color/512/first.png",
            })
            .setColor("#73ff00"),
        ],
      });
    } catch (error: { name: string; message: string } | any) {
      interaction.editReply({
        content: null,
        components: undefined,
        files: undefined,
        attachments: undefined,
        embeds: [
          CommonEmbedBuilder.error({
            title: error.name,
            description: error.message,
          }),
        ],
      });
    }
  },
  name: "back",
  description: "Play the previous song",
  deleted: false,
  voiceChannel: true,
  permissionsRequired: [PermissionFlagsBits.Connect],
  botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
};

export default command;
