import { GuildMember, MessageFlags } from "discord.js";
import TemporaryVoiceChannel from "../../../models/TemporaryVoiceChannel";
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";

const select: SelectMenuInterface = {
  async execute(interaction, client) {
    // Get the user's voice channel
    const userVoiceChannel = (interaction.member as GuildMember).voice.channel!;

    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      // Get the current owner of the voice channel
      const tempChannelDoc = await TemporaryVoiceChannel.findOne({ channelId: userVoiceChannel?.id });
      if (!tempChannelDoc) return;
      const ownerOfVoiceChannel = tempChannelDoc.userId;

      // Check if the interacting user is already the owner
      if (interaction.user.id == ownerOfVoiceChannel)
        throw new client.CustomError({
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
        throw new client.CustomError({
          name: "OwnerInChannel",
          message: "The owner of this channel is still in the channel.",
          type: "warning",
        });

      // Set the interacting user as the new owner
      tempChannelDoc.userId = interaction.user.id;
      await tempChannelDoc.save();
      interaction.editReply({
        embeds: [
          client.CommonEmbedBuilder.success({
            title: "> Claimed Temporary Channel",
            description: "You have claimed this temporary channel.",
          }),
        ],
      });

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
