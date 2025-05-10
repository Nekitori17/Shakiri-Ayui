import path from "path";
import jsonStore from "json-store-typed";
import { GuildMember, MessageFlags } from "discord.js";
import sendError from "../../../helpers/sendError";
import CommonEmbedBuilder from "../../../helpers/commonEmbedBuilder";
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";

const select: SelectMenuInterface = {
  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const userVoiceChannel = (interaction.member as GuildMember).voice.channel!;

    try {
      const temporaryChannels = jsonStore(
        path.join(__dirname, "../../../../database/temporaryVoiceChannels.json")
      );

      const ownerOfVoiceChannel = temporaryChannels.get(userVoiceChannel?.id);
      if (!ownerOfVoiceChannel) return;

      if (interaction.user.id == ownerOfVoiceChannel)
        throw {
          name: "AlreadyOwner",
          message: "You are already the owner of this channel.",
        };
      if (
        userVoiceChannel?.members.find(
          (member) => member.id === ownerOfVoiceChannel
        )
      )
        throw {
          name: "OwnerInChannel",
          message: "The owner of this channel is still in the channel.",
        };

      temporaryChannels.set(userVoiceChannel?.id, interaction.user.id);
      interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: "> Claimed Temporary Channel",
            description: "You have claimed this temporary channel.",
          }),
        ],
      });
    } catch (error) {
      sendError(interaction, error, true);
    }
  },
  disabled: false,
  voiceChannel: true,
};

export default select;
