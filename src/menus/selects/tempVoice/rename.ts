import {
  ActionRowBuilder,
  GuildMember,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import UserSettings from "../../../models/UserSettings";
import sendError from "../../../helpers/utils/sendError";
import { CustomError } from "../../../helpers/utils/CustomError";
import checkOwnTempVoice from "../../../validator/checkOwnTempVoice";
import CommonEmbedBuilder from "../../../helpers/embeds/commonEmbedBuilder";
import { genericVariableReplacer } from "../../../helpers/utils/variableReplacer";
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";

const select: SelectMenuInterface = {
  async execute(interaction, client) {
    // Get the user's voice channel
    const userVoiceChannel = (interaction.member as GuildMember).voice.channel!;

    try {
      // Check if the temporary voice channel belongs to the interacting user
      if (!checkOwnTempVoice(userVoiceChannel.id, interaction.user.id))
        throw new CustomError({
          name: "NotOwnTempVoiceError",
          message: "This temporary voice channel does not belong to you.",
        });

      // Create a modal for renaming the temporary voice channel
      const renameModal = new ModalBuilder()
        .setCustomId("rename-temp-voice")
        .setTitle("Rename Temporary Voice Channel")
        .addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("new-name")
              .setLabel("New Name")
              .setRequired(true)
              .setStyle(TextInputStyle.Short)
              .setPlaceholder(
                "Variable: {user.displayName}, {user.username}, {guild.name}, {guild.count},..."
              )
          )
        );
      // Show the modal to the user
      await interaction.showModal(renameModal);
      // Await the modal submission
      const renameModalInteraction = await interaction.awaitModalSubmit({
        time: 60000,
      });

      try {
        await renameModalInteraction.deferReply({
          flags: MessageFlags.Ephemeral,
        });
        const newNameInputValue =
          renameModalInteraction.fields.getTextInputValue("new-name");

        // Find and update user settings, creating if it doesn't exist
        const userSetting = await UserSettings.findOneAndUpdate(
          {
            userId: interaction.user.id,
          },
          {
            $setOnInsert: {
              userId: interaction.user.id,
            },
          },
          {
            upsert: true,
            new: true,
          }
        );

        // Update the channel name in user settings
        userSetting.temporaryVoiceChannel.channelName = newNameInputValue;
        await userSetting.save();

        // Set the new name for the voice channel, replacing variables
        await userVoiceChannel.setName(
          genericVariableReplacer(
            newNameInputValue,
            interaction.user,
            interaction.guild!,
            client
          )
        );

        // Edit the reply to confirm the name change
        renameModalInteraction.editReply({
          embeds: [
            CommonEmbedBuilder.success({
              title: "> Changed Temporary Channel Name",
              description: `Changed to name: \`${newNameInputValue}\``,
            }),
          ],
        });
      } catch (error) {
        sendError(renameModalInteraction, error);
      }

      return true;
    } catch (error) {
      sendError(interaction, error);

      return false;
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default select;
