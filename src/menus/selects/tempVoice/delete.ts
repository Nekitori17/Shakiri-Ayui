import { GuildMember } from "discord.js";
import checkOwnTempVoice from "../../../helpers/discord/validators/checkOwnTempVoice";
import TemporaryVoiceChannel from "../../../models/TemporaryVoiceChannel";
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";

const select: SelectMenuInterface = {
  async execute(interaction, client) {
    // Get the user's voice channel
    const userVoiceChannel = (interaction.member as GuildMember).voice.channel;

    try {
      // Check if the temporary voice channel belongs to the interacting user
      if (!(await checkOwnTempVoice(userVoiceChannel?.id!, interaction.user.id)))
        throw new client.CustomError({
          name: "NotOwnTempVoiceError",
          message: "This temporary voice channel does not belong to you.",
          type: "warning",
        });

      // Delete the temporary channel entry from the store
      await TemporaryVoiceChannel.deleteOne({ channelId: userVoiceChannel?.id });
      // Defer the update to prevent interaction timeout
      await interaction.deferUpdate();
      // Delete the voice channel itself
      userVoiceChannel?.delete();

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error, true);

      return false;
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default select;
