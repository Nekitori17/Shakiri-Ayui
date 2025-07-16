import config from "../../config";
import {
  ActionRowBuilder,
  AttachmentBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { handleInteractionError } from "../../helpers/utils/handleError";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      // Fetch the current guild settings
      const guildSetting = await config.modules(interaction.guildId!);
      
      // Create TextInputBuilders for each customizable setting
      const welcomerCustomizeModalComponents = [
        new TextInputBuilder()
          .setCustomId("welcome-message")
          .setLabel("Welcome Message")
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder(
            "Write your message here" +
              "\n" +
              "Variables: {user}, {user.displayName}, {guild.count}, {guild.name},..."
          )
          .setRequired(false)
          .setValue(guildSetting.welcomer.message),
        new TextInputBuilder()
          .setCustomId("image-title")
          .setLabel("Image Title")
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder(
            "Write your image title here" +
              "\n" +
              "Variables: {user}, {user.displayName}, {guild.count}, {guild.name},..."
          )
          .setRequired(false)
          .setValue(guildSetting.welcomer.imageTitle),
        new TextInputBuilder()
          .setCustomId("image-body")
          .setLabel("Image Body")
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder(
            "Write your image body here" +
              "\n" +
              "Variables: {user}, {user.displayName}, {guild.count}, {guild.name},..."
          )
          .setRequired(false)
          .setValue(guildSetting.welcomer.imageBody),
        new TextInputBuilder()
          .setCustomId("image-footer")
          .setLabel("Image Footer")
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder(
            "Write your image footer here" +
              "\n" +
              "Variables: {user}, {user.displayName}, {guild.count}, {guild.name},..."
          )
          .setRequired(false)
          .setValue(guildSetting.welcomer.imageFooter),
      ];

      // Create ActionRowBuilder for each TextInputBuilder
      const welcomerCustomizeRowComponents =
        welcomerCustomizeModalComponents.map((modalComponent) =>
          new ActionRowBuilder<TextInputBuilder>().addComponents(modalComponent)
        );

      // Create the modal for advanced settings
      const advancedSettingPanel = new ModalBuilder()
        .setCustomId(`set-welcomer-modal-${interaction.user.id}`)
        .setTitle("Customize Settings")
        .addComponents(...welcomerCustomizeRowComponents);

      // Show the modal to the user
      await interaction.showModal(advancedSettingPanel);

      // Wait for the modal submission
      const welcomerCustomizeModalInteraction =
        await interaction.awaitModalSubmit({
          filter: (i) =>
            i.customId === `set-welcomer-modal-${interaction.user.id}`,
          time: 900000,
        });

      try {
        // Defer the reply to the modal submission
        await welcomerCustomizeModalInteraction.deferReply();
        guildSetting.welcomer = {
          enabled: guildSetting.welcomer.enabled,
          channelSend: guildSetting.welcomer.channelSend,
          message:
            welcomerCustomizeModalInteraction.fields.getTextInputValue(
              "welcome-message"
            ) || guildSetting.welcomer.message,
          imageTitle:
            welcomerCustomizeModalInteraction.fields.getTextInputValue(
              "image-title"
            ) || guildSetting.welcomer.imageTitle,
          imageBody:
            welcomerCustomizeModalInteraction.fields.getTextInputValue(
              "image-body"
            ) || guildSetting.welcomer.imageBody,
          imageFooter:
            welcomerCustomizeModalInteraction.fields.getTextInputValue(
              "image-footer"
            ) || guildSetting.welcomer.imageFooter,
        };

        // Save the updated settings
        await guildSetting.save();

        // Prepare the advanced settings text for attachment
        const advancedSettingsTxt =
          ">> Custom Message <<" +
          "\n" +
          guildSetting.welcomer.message +
          "\n" +
          ">> Image Title <<" +
          "\n" +
          guildSetting.welcomer.imageTitle +
          "\n" +
          ">> Image Body <<" +
          "\n" +
          guildSetting.welcomer.imageBody +
          "\n" +
          ">> Image Footer <<" +
          "\n" +
          guildSetting.welcomer.imageFooter;

        // Create an attachment with the advanced settings data
        const advancedSettingFileAttachment = new AttachmentBuilder(
          Buffer.from(advancedSettingsTxt, "utf-8"),
          {
            name: "customize-setting-data.md",
          }
        );

        // Send a success message with the updated settings and attachment
        welcomerCustomizeModalInteraction.editReply({
          embeds: [
            CommonEmbedBuilder.success({
              title: "Updated **Welcomer** module settings",
              description: `**Enabled**: \`${
                guildSetting.welcomer.enabled
              }\`, **Channel Send**: ${
                guildSetting.welcomer.channelSend
                  ? `<#${guildSetting.welcomer.channelSend}>`
                  : "`None`"
              }`,
            }),
          ],
          files: [advancedSettingFileAttachment],
        });
      } catch (error) {
        handleInteractionError(welcomerCustomizeModalInteraction, error);
      }

      return true;
    } catch (error) {
      handleInteractionError(interaction, error);

      return false;
    }
  },
  name: "set-welcomer-customize",
  description: "More customize for welcomer module",
  deleted: false,
  devOnly: false,
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
