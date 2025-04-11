import {
  ActionRowBuilder,
  ComponentType,
  GuildMember,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import sendError from "../../../helpers/sendError";
import checkOwnTempVoice from "../../../validator/checkOwnTempVoice";
import { rtcRegionList } from "../../../constants/rtcRegionList";
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";

const select: SelectMenuInterface = {
  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const userVoiceChannel = (interaction.member as GuildMember).voice.channel;

    try {
      if (!checkOwnTempVoice(userVoiceChannel?.id!, interaction.user.id))
        throw {
          name: "NotOwnTempVoiceError",
          message: "This temporary voice channel does not belong to you.",
        };

      const regionSelectMenu = Object.entries(rtcRegionList).map(
        ([name, value]) =>
          new StringSelectMenuOptionBuilder().setLabel(name).setValue(value)
      );
      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("temp-voice-region")
          .setPlaceholder("Select a region")
          .addOptions(regionSelectMenu)
      );

      const sent = await interaction.editReply({
        content: "Select a region for your temporary voice channel",
        components: [row],
      });

      const collector = sent.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 60000,
      });

      collector.on("collect", async (selectInteraction) => {
        await selectInteraction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
          const regionName = selectInteraction.values[0];

          await userVoiceChannel?.setRTCRegion(regionName);

          selectInteraction.editReply(`> Region changed to \`${selectInteraction.values[0]}\``);
        } catch (error) {
          sendError(selectInteraction, error, true);
        }
      });
    } catch (error) {
      sendError(interaction, error, true);
    }
  },
  disabled: false,
  voiceChannel: true,
};

export default select;
