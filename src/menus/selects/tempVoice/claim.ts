import path from "path";
import { GuildMember, MessageFlags } from "discord.js";
import jsonStore from "json-store-typed";
import { CustomError } from "../../../helpers/utils/CustomError";
import { handleInteractionError } from "../../../helpers/utils/handleError";
import CommonEmbedBuilder from "../../../helpers/embeds/commonEmbedBuilder";
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";

const select: SelectMenuInterface = {
  async execute(interaction, client) {
    // Get the user's voice channel
    const userVoiceChannel = (interaction.member as GuildMember).voice.channel!;

    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      // Initialize jsonStore for temporary voice channels
      const temporaryChannels = jsonStore(
        path.join(__dirname, "../../../../database/temporaryVoiceChannels.json")
      );

      // Get the current owner of the voice channel
      const ownerOfVoiceChannel = temporaryChannels.get(userVoiceChannel?.id);
      if (!ownerOfVoiceChannel) return;

      // Check if the interacting user is already the owner
      if (interaction.user.id == ownerOfVoiceChannel)
        throw new CustomError({
          name: "AlreadyOwner",
          message: "You are already the owner of this channel.",
          type: "info",
        });

      // Check if the current owner is still in the channel
      if (
        userVoiceChannel?.members.find(
          (member) => member.id === ownerOfVoiceChannel
        )
      )
        throw new CustomError({
          name: "OwnerInChannel",
          message: "The owner of this channel is still in the channel.",
          type: "warning",
        });

      // Set the interacting user as the new owner
      temporaryChannels.set(userVoiceChannel?.id, interaction.user.id);
      interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: "> Claimed Temporary Channel",
            description: "You have claimed this temporary channel.",
          }),
        ],
      });

      return true;
    } catch (error) {
      handleInteractionError(interaction, error);

      return false;
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default select;
