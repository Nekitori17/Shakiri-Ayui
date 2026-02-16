import path from "path";
import { GuildMember } from "discord.js";
import jsonStore from "json-store-typed";
import checkOwnTempVoice from "../../../helpers/discord/validators/checkOwnTempVoice";
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";

const select: SelectMenuInterface = {
  async execute(interaction, client) {
    // Get the user's voice channel
    const userVoiceChannel = (interaction.member as GuildMember).voice.channel;

    try {
      // Initialize jsonStore for temporary voice channels
      const temporaryChannels = jsonStore(
        path.join(__dirname, "../../../../database/temporaryVoiceChannels.json")
      );

      // Check if the temporary voice channel belongs to the interacting user
      if (!checkOwnTempVoice(userVoiceChannel?.id!, interaction.user.id))
        throw new client.CustomError({
          name: "NotOwnTempVoiceError",
          message: "This temporary voice channel does not belong to you.",
          type: "warning",
        });

      // Delete the temporary channel entry from the store
      temporaryChannels.del(userVoiceChannel?.id!);
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
