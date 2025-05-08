import {
  ActionRowBuilder,
  GuildMember,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import UserSettings from "../../../models/UserSettings";
import sendError from "../../../helpers/sendError";
import checkOwnTempVoice from "../../../validator/checkOwnTempVoice";
import CommonEmbedBuilder from "../../../helpers/commonEmbedBuilder";
import { genericVariableReplacer } from "../../../helpers/variableReplacer";
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";

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

      await interaction.showModal(renameModal);
      const modalInteraction = await interaction.awaitModalSubmit({
        time: 60000,
      });
      await modalInteraction.deferReply({ flags: MessageFlags.Ephemeral });
      const newName = modalInteraction.fields.getTextInputValue("new-name");

      const userSettings = await UserSettings.findOne({
        userId: interaction.user.id,
      });

      if (userSettings) {
        userSettings.temporaryVoiceChannel.channelName = newName;
        await userSettings.save();
      } else {
        const newUserSettings = new UserSettings({
          userId: interaction.user.id,
          temporaryVoiceChannel: {
            channelName: newName,
            blockedUsers: [],
            limitUser: 0,
          },
        });

        await newUserSettings.save();
      }

      await userVoiceChannel?.setName(
        genericVariableReplacer(
          newName,
          interaction.user,
          interaction.guild!,
          client
        )
      );
      modalInteraction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: "> Changed Temporary Channel Name",
            description: `Changed to name: \`${newName}\``,
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
