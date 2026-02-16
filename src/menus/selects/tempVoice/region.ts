import {
  ActionRowBuilder,
  ComponentType,
  GuildMember,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import checkOwnTempVoice from "../../../helpers/discord/validators/checkOwnTempVoice";
import { rtcRegionList } from "../../../constants/rtcRegionList";
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";

const select: SelectMenuInterface = {
  async execute(interaction, client) {
    // Get the user's voice channel
    const userVoiceChannel = (interaction.member as GuildMember).voice.channel!;

    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      // Check if the temporary voice channel belongs to the interacting user
      if (!checkOwnTempVoice(userVoiceChannel.id, interaction.user.id))
        throw new client.CustomError({
          name: "NotOwnTempVoiceError",
          message: "This temporary voice channel does not belong to you.",
        });

      // Create options for the region select menu from rtcRegionList
      const regionSelectMenuOption = Object.entries(rtcRegionList).map(
        ([name, value]) =>
          new StringSelectMenuOptionBuilder().setLabel(value).setValue(name),
      );
      // Create an ActionRow with a StringSelectMenu for region selection
      const regionSelectMenuRow =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("temp-voice-region")
            .setPlaceholder("Select a region")
            .addOptions(regionSelectMenuOption),
        );

      // Edit the deferred reply to display the region selection menu
      const regionSelectReply = await interaction.editReply({
        content: "Select a region for your temporary voice channel",
        components: [regionSelectMenuRow],
      });

      // Create a message component collector for the region selection menu
      const collector = regionSelectReply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 60000,
      });

      // Handle the collection of selected region
      collector.on("collect", async (regionSelectInteraction) => {
        try {
          // Defer the reply to prevent interaction timeout
          await regionSelectInteraction.deferReply({
            flags: MessageFlags.Ephemeral,
          });

          // Set the RTC region for the voice channel
          const regionName = regionSelectInteraction.values[0];
          await userVoiceChannel.setRTCRegion(regionName);

          // Edit the reply to confirm the region change
          regionSelectInteraction.editReply({
            embeds: [
              client.CommonEmbedBuilder.success({
                title: "> Changed Temporary Channel Region",
                description: `Changed to region: \`${
                  rtcRegionList[regionName as keyof typeof rtcRegionList]
                }\``,
              }),
            ],
          });
        } catch (error) {
          client.interactionErrorHandler(regionSelectInteraction, error, true);
        }
      });

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error, true);

      return false;
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default select;
