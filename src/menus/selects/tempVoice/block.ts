import {
  ActionRowBuilder,
  ComponentType,
  GuildMember,
  MessageFlags,
  UserSelectMenuBuilder,
} from "discord.js";
import sendError from "../../../helpers/utils/sendError";
import { CustomError } from "../../../helpers/utils/CustomError";
import checkOwnTempVoice from "../../../validator/checkOwnTempVoice";
import CommonEmbedBuilder from "../../../helpers/embeds/commonEmbedBuilder";
import UserSettings from "../../../models/UserSettings";
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";

const select: SelectMenuInterface = {
  async execute(interaction, client) {
    // Get the user's voice channel
    const userVoiceChannel = (interaction.member as GuildMember).voice.channel;

    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      // Check if the temporary voice channel belongs to the interacting user
      if (!checkOwnTempVoice(userVoiceChannel?.id!, interaction.user.id))
        throw new CustomError({
          name: "NotOwnTempVoiceError",
          message: "This temporary voice channel does not belong to you.",
          type: "warning",
        });

      // Create an ActionRow with a UserSelectMenu for blocking users
      const allUserSelectRow =
        new ActionRowBuilder<UserSelectMenuBuilder>().setComponents(
          new UserSelectMenuBuilder()
            .setCustomId("temp-voice-block")
            .setPlaceholder("Select a user to block")
            .setMinValues(1)
            .setMaxValues(10)
        );

      // Edit the deferred reply to display the user selection menu
      const selectUserReply = await interaction.editReply({
        content: "> Select a user to block from your temporary voice channel",
        components: [allUserSelectRow],
      });

      // Create a message component collector for the user selection menu
      const selectUserCollector =
        selectUserReply.createMessageComponentCollector({
          componentType: ComponentType.UserSelect,
          time: 60_000,
        });

      // Handle the collection of selected users
      selectUserCollector.on("collect", async (userSelectInteraction) => {
        // Handle the collection of selected users
        try {
          await userSelectInteraction.deferReply({
            flags: MessageFlags.Ephemeral,
          });

          const userBlocks = userSelectInteraction.users;
          const userSetting = await UserSettings.findOneAndUpdate(
            {
              userId: userSelectInteraction.user.id,
            },
            {
              $setOnInsert: {
                userId: userSelectInteraction.user.id,
              },
            },
            {
              upsert: true,
              new: true,
            }
          );

          // Add selected users to the blockedUsers list in user settings
          userBlocks.forEach((user) => {
            if (
              !userSetting.temporaryVoiceChannel.blockedUsers.includes(
                user.id
              ) &&
              user.id != userSelectInteraction.user.id
            )
              userSetting.temporaryVoiceChannel.blockedUsers.push(user.id);
          });

          // Save the updated user settings
          await userSetting.save();

          // Disconnect blocked users from the voice channel if they are in it
          userBlocks.forEach(async (user) => {
            const member = await userSelectInteraction.guild?.members.fetch(
              user.id
            );
            if (
              member &&
              member?.voice.channelId === userVoiceChannel?.id &&
              user.id != userSelectInteraction.user.id
            ) {
              await member.voice.disconnect();
            }
          });

          // Edit the reply to confirm the blocked users
          userSelectInteraction.editReply({
            embeds: [
              CommonEmbedBuilder.success({
                title: "> Blocked Users",
                description: `Blocked users: ${userBlocks
                  .map((user) => `<@${user.id}>`)
                  .join(", ")}`,
              }),
            ],
          });
        } catch (error) {
          sendError(userSelectInteraction, error);
        }
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default select;
