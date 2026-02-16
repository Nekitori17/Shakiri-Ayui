import {
  ApplicationCommandOptionType,
  GuildMember,
  MessageFlags,
} from "discord.js";
import checkOwnTempVoice from "../../helpers/discord/validators/checkOwnTempVoice";
import { genericVariableFormatter } from "../../helpers/formatters/variableFormatter";
import UserSettings from "../../models/UserSettings";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const newNameOption = interaction.options.getString("name", true);

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
          returnDocument: "after",
        },
      );

      userSetting.temporaryVoiceChannel.channelName = newNameOption;
      await userSetting.save();

      const userVoiceChannel = (interaction.member as GuildMember).voice
        .channel;

      if (userVoiceChannel)
        if (checkOwnTempVoice(userVoiceChannel.id, interaction.user.id))
          await userVoiceChannel.setName(
            genericVariableFormatter(
              newNameOption,
              interaction.user,
              interaction.guild!,
              client,
            ),
          );

      interaction.editReply({
        embeds: [
          client.CommonEmbedBuilder.success({
            title:
              "> <:colorrename:1387286560722128987> Changed Temporary Channel Name",
            description: `Changed to name: \`${newNameOption}\``,
          }),
        ],
      });

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  name: "voice-rename",
  description: "Change the name of your temporary voice channel",
  disabled: false,
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "name",
      description:
        "The new name of your voice channel (Variable:{user.displayName}, {user.username}, {guild.name},...)",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  useInDm: true,
  requiredVoiceChannel: false,
};

export default command;
