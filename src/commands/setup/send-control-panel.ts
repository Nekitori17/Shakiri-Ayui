import { EmbedBuilder, MessageFlags, PermissionFlagsBits } from "discord.js";
import { CustomError } from "../../helpers/utils/CustomError";
import { handleInteractionError } from "../../helpers/utils/handleError";
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
        throw new CustomError({
          name: "SendControlPanelError",
          message: "The channel is not sendable.",
        });

      // Create the control panel embed
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
            "Feel free to manage your channel or music from the menu below ♪"
        )
        .setImage("https://files.catbox.moe/7i6rnj.png")
        .setColor("White");

      // Send the control panel message
      await interaction.channel.send({
        content: CONTROL_PANEL_TAG,
        embeds: [controlPanelEmbed],
        components: [
          temporaryVoiceMenu,
          ...advancedMusicControllerButtonRows,
          extendAdvancedMusicControllerButtonRow,
        ],
      });

      // Confirm sending the control panel
      await interaction.editReply("✅ | Control panel sent!");

      return true;
    } catch (error) {
      handleInteractionError(interaction, error);
      return false;
    }
  },
  name: "send-control-panel",
  description: "Send a temporary voice menu",
  deleted: false,
  devOnly: false,
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
