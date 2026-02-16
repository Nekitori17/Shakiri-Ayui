import { EmbedBuilder, MessageFlags, PermissionFlagsBits } from "discord.js";
import temporaryVoiceMenu from "../../components/temporaryVoiceMenu";
import {
  advancedMusicControllerButtonRows,
  extendAdvancedMusicControllerButtonRow,
} from "../../components/musicControllerMenu";
import { CommandInterface } from "../../types/InteractionInterfaces";

const CONTROL_PANEL_TAG = "\u200B";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      if (!interaction.channel?.isSendable())
        throw new client.CustomError({
          name: "SendControlPanelError",
          message: "The channel is not sendable.",
        });

      const controlPanelEmbed = new EmbedBuilder()
        .setAuthor({
          name: interaction.guild?.name!,
          iconURL: interaction.guild?.iconURL()!,
        })
        .setTitle("> Multi-function Control Panel")
        .setDescription(
          "Looks like you already have a temporary voice channel!" +
            "\n" +
            "Do you want to play something?" +
            "\n\n" +
            "Feel free to manage your channel or music from the menu below ♪",
        )
        .setImage("https://files.catbox.moe/7i6rnj.png")
        .setColor("White");

      await interaction.channel.send({
        content: CONTROL_PANEL_TAG,
        embeds: [controlPanelEmbed],
        components: [
          temporaryVoiceMenu,
          ...advancedMusicControllerButtonRows,
          extendAdvancedMusicControllerButtonRow,
        ],
      });

      await interaction.editReply("✅ | Control panel sent!");

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);
      return false;
    }
  },
  name: "send-control-panel",
  description: "Send a temporary voice menu",
  disabled: false,
  deleted: false,
  devOnly: false,
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
