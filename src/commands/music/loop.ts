import {
  ApplicationCommandOptionType,
  Client,
  CommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { CommandInterface } from "../../types/InteractionInterfaces";
import { useQueue } from "discord-player";
import { repeatModeNames } from "../../data/musicRepeatModes";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";

const command: CommandInterface = {
  async execute(interaction: CommandInteraction, client: Client) {
    await interaction.deferReply();
    const repeatMode = interaction.options.get("mode")?.value as number;
    const repeatModeName =
      repeatModeNames[repeatMode as keyof typeof repeatModeNames];

    try {
      const queue = useQueue(interaction.guild?.id!);
      if (!queue)
        throw {
          name: "No Queue",
          message: "There is no queue to loop",
        };

      queue.setRepeatMode(repeatMode);
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `🎶 Set loop mode to ${repeatModeName}`,
              iconURL: "https://img.icons8.com/fluency/512/repeat.png",
            })
            .setColor("#5a01ff"),
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
  name: "loop",
  description: "Set the loop mode",
  options: [
    {
      name: "mode",
      description: "Loop mode",
      type: ApplicationCommandOptionType.Number,
      required: true,
      choices: [
        {
          name: "Off",
          value: "0",
        },
        {
          name: "Track",
          value: "1",
        },
        {
          name: "Queue",
          value: "2",
        },
        {
          name: "Autoplay",
          value: "3",
        },
      ],
    },
  ],
  deleted: false,
  voiceChannel: true,
  permissionsRequired: [PermissionFlagsBits.Connect],
  botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
};

export default command;
