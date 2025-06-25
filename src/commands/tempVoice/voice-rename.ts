import {
  ApplicationCommandOptionType,
  GuildMember,
  MessageFlags,
} from "discord.js";
import UserSettings from "../../models/UserSettings";
import sendError from "../../helpers/utils/sendError";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import checkOwnTempVoice from "../../validator/checkOwnTempVoice";
import { genericVariableReplacer } from "../../helpers/utils/variableReplacer";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const newName = interaction.options.get("name")?.value as string;

    try {
      const userSettings = await UserSettings.findOneAndUpdate(
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

      userSettings.temporaryVoiceChannel.channelName = newName;
      await userSettings.save();

      const userVoiceChannel = (interaction.member as GuildMember).voice
        .channel;
      if (userVoiceChannel)
        if (checkOwnTempVoice(userVoiceChannel.id, interaction.user.id))
          await userVoiceChannel.setName(
            genericVariableReplacer(
              newName,
              interaction.user,
              interaction.guild!,
              client
            )
          );

      interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title:
              "> <:colorrename:1387286560722128987> Changed Temporary Channel Name",
            description: `Changed to name: \`${newName}\``,
          }),
        ],
      });
    } catch (error) {
      sendError(interaction, error, true);
    }
  },
  name: "voice-rename",
  description: "Change the name of your temporary voice channel",
  options: [
    {
      name: "name",
      description:
        "The new name of your voice channel (Variable:{user.displayName}, {user.username}, {guild.name},...)",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  deleted: false,
  canUseInDm: true,
};

export default command;
