import { EmbedBuilder, MessageFlags, PermissionFlagsBits } from "discord.js";
import { CommandInterface } from "../../types/InteractionInterfaces";
import sendError from "../../helpers/utils/sendError";
import temporaryVoiceMenu from "../../components/temporaryVoiceMenu";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      if (interaction.channel?.isSendable())
        // Send the temporary voice menu embed and components to the channel
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

      // Edit the deferred reply to indicate success
      interaction.editReply("✅ | Done!");
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "send-temp-voice-menu",
  description: "Send a temporary voice menu",
  deleted: false,
  devOnly: true,
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
