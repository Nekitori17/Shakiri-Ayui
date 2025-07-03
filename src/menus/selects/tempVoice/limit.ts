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
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";

function isNumber(value: any) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

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

      // Create a modal for setting the user limit
      const renameModal = new ModalBuilder()
        .setCustomId("limit-temp-voice")
        .setTitle("Limit Temporary Voice Channel")
        .addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("amount")
              .setLabel("Limit amount of users")
              .setRequired(true)
              .setStyle(TextInputStyle.Short)
              .setPlaceholder("Set 0 to unlimited")
          )
        );

      // Show the modal to the user
      await interaction.showModal(renameModal);
      // Await the modal submission
      const limitUserModalInteraction = await interaction.awaitModalSubmit({
        time: 60000,
      });

      try {
        // Defer the reply to prevent interaction timeout
        await limitUserModalInteraction.deferReply({
          flags: MessageFlags.Ephemeral,
        });

        const amountOfLimitStrInputValue =
          limitUserModalInteraction.fields.getTextInputValue("amount");

        // Validate if the input is a number
        if (!isNumber(amountOfLimitStrInputValue))
          throw new CustomError({
            name: "ThisIsNotANumber",
            message: "Please try again with correct value",
          });

        // Convert the input value to a number and ensure it's an integer
        const amountOfLimit = Math.floor(Number(amountOfLimitStrInputValue));

        // Validate if the amount is within the valid range (0-99)
        if (amountOfLimit < 0 || amountOfLimit > 99)
          throw new CustomError({
            name: "InvalidNumber",
            message: "Please enter a number between 0 and 99.",
            type: "warning",
          });

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

        // Update the user limit in user settings
        userSetting.temporaryVoiceChannel.limitUser = amountOfLimit;
        await userSetting.save();

        // Set the user limit for the voice channel
        await userVoiceChannel.setUserLimit(amountOfLimit);

        // Edit the reply to confirm the limit change
        limitUserModalInteraction.editReply({
          embeds: [
            CommonEmbedBuilder.success({
              title: "> Changed Temporary Channel Limit User",
              description: `Changed to amount: \`${amountOfLimit}\``,
            }),
          ],
        });
      } catch (error) {
        sendError(limitUserModalInteraction, error);
      }
    } catch (error) {
      sendError(interaction, error);
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default select;
