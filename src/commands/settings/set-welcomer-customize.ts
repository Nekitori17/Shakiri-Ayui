import config from "../../config";
import {
  ActionRowBuilder,
  AttachmentBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import sendError from "../../helpers/utils/sendError";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      const settings = await config.modules(interaction.guildId!);

      const modalComponents = [
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
          .setValue(settings.welcomer.message),
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
          .setValue(settings.welcomer.imageTitle),
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
          .setValue(settings.welcomer.imageBody),
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
          .setValue(settings.welcomer.imageFooter),
      ];

      const actionRowComponents = modalComponents.map((modalComponent) =>
        new ActionRowBuilder<TextInputBuilder>().addComponents(modalComponent)
      );

      const advancedSettingsPanel = new ModalBuilder()
        .setCustomId(`set-welcomer-modal-${interaction.user.id}`)
        .setTitle("Customize Settings")
        .addComponents(...actionRowComponents);

      await interaction.showModal(advancedSettingsPanel);
      interaction
        .awaitModalSubmit({
          filter: (i) =>
            i.customId === `set-welcomer-modal-${interaction.user.id}`,
          time: 900_000,
        })
        .then(async (modalInteraction) => {
          await modalInteraction.deferReply();
          settings.welcomer = {
            enabled: settings.welcomer.enabled!,
            channelSend: settings.welcomer.channelSend,
            message:
              modalInteraction.fields.getTextInputValue("welcome-message") ||
              settings.welcomer.message,
            imageTitle:
              modalInteraction.fields.getTextInputValue("image-title") ||
              settings.welcomer.imageTitle,
            imageBody:
              modalInteraction.fields.getTextInputValue("image-body") ||
              settings.welcomer.imageBody,
            imageFooter:
              modalInteraction.fields.getTextInputValue("image-footer") ||
              settings.welcomer.imageFooter,
          };

          await settings.save();

          const advancedSettingsTxt =
            ">> Custom Message <<" +
            "\n" +
            settings.welcomer.message +
            "\n" +
            ">> Image Title <<" +
            "\n" +
            settings.welcomer.imageTitle +
            "\n" +
            ">> Image Body <<" +
            "\n" +
            settings.welcomer.imageBody +
            "\n" +
            ">> Image Footer <<" +
            "\n" +
            settings.welcomer.imageFooter;

          const fileContent = Buffer.from(advancedSettingsTxt, "utf-8");
          const attachment = new AttachmentBuilder(fileContent, {
            name: "customize-setting-data.md",
          });

          modalInteraction.editReply({
            embeds: [
              CommonEmbedBuilder.success({
                title: "Updated **Welcomer** module settings",
                description: `**Enabled**: \`${
                  settings.welcomer.enabled
                }\`, **Channel Send**: ${
                  settings.welcomer.channelSend
                    ? `<#${settings.welcomer.channelSend}>`
                    : "`None`"
                }`,
              }),
            ],
            files: [attachment],
          });
        })
        .catch((e) => {
          throw e;
        });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "set-welcomer-customize",
  description: "More customize for welcomer module",
  deleted: false,
  permissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
