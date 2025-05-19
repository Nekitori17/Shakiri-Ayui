import { EmbedBuilder, MessageFlags, PermissionFlagsBits } from "discord.js";
import { CommandInterface } from "../../types/InteractionInterfaces";
import sendError from "../../helpers/utils/sendError";
import temporaryVoiceMenu from "../../components/temporaryVoiceMenu";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      if (interaction.channel?.isSendable())
        await interaction.channel.send({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: interaction.guild?.name!,
                iconURL: interaction.guild?.iconURL()!,
              })
              .setTitle("> Temporary Voice Menu Interface")
              .setDescription(
                "Oh, it seems you already have a temporary voice channel." +
                  "\n" +
                  "Let control your channel with menu in below"
              )
              .setColor("White")
              .setFooter({
                text: `Temporary Voice Module | ${client.user?.displayName}`,
                iconURL: "https://img.icons8.com/stencil/512/medium-volume.png",
              }),
          ],
          components: [temporaryVoiceMenu],
        });

      interaction.editReply("✅ | Done!");
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "send-temp-voice-menu",
  description: "Send a temporary voice menu",
  deleted: false,
  permissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
