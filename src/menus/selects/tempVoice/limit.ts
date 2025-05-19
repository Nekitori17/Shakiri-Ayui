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
import checkOwnTempVoice from "../../../validator/checkOwnTempVoice";
import CommonEmbedBuilder from "../../../helpers/embeds/commonEmbedBuilder";
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";

function isNumber(value: any) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

const select: SelectMenuInterface = {
  async execute(interaction, client) {
    const userVoiceChannel = (interaction.member as GuildMember).voice.channel;

    try {
      if (!checkOwnTempVoice(userVoiceChannel?.id!, interaction.user.id))
        throw {
          name: "NotOwnTempVoiceError",
          message: "This temporary voice channel does not belong to you.",
        };

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

      await interaction.showModal(renameModal);
      const modalInteraction = await interaction.awaitModalSubmit({
        time: 60000,
      });
      try {
        await modalInteraction.deferReply({ flags: MessageFlags.Ephemeral });
        const amountOfLimitStr =
          modalInteraction.fields.getTextInputValue("amount");
        if (!isNumber(amountOfLimitStr))
          throw {
            name: "ThisIsNotANumber",
            message: "Please try again with correct value",
          };
  
        const amountOfLimit = Number(amountOfLimitStr);
  
        const userSettings = await UserSettings.findOne({
          userId: interaction.user.id,
        });
  
        if (userSettings) {
          userSettings.temporaryVoiceChannel.limitUser = amountOfLimit;
          await userSettings.save();
        } else {
          const newUserSettings = new UserSettings({
            userId: interaction.user.id,
            temporaryVoiceChannel: {
              channelName: null,
              blockedUsers: [],
              limitUser: amountOfLimit,
            },
          });
  
          await newUserSettings.save();
        }
  
        await userVoiceChannel?.setUserLimit(amountOfLimit);
        modalInteraction.editReply({
          embeds: [
            CommonEmbedBuilder.success({
              title: "> Changed Temporary Channel Limit User",
              description: `Changed to amount: \`${amountOfLimit}\``,
            }),
          ],
        });
      } catch (error) {
        sendError(modalInteraction, error, true);
      }
    } catch (error) {
      sendError(interaction, error, true);
    }
  },
  disabled: false,
  voiceChannel: true,
};

export default select;
