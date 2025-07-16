import {
  ApplicationCommandOptionType,
  GuildMember,
  MessageFlags,
} from "discord.js";
import UserSettings from "../../models/UserSettings";
import checkOwnTempVoice from "../../validator/checkOwnTempVoice";
import { handleInteractionError } from "../../helpers/utils/handleError";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import { genericVariableReplacer } from "../../helpers/utils/variableReplacer";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const newNameOption = interaction.options.getString("name", true);
      
      // Find teh user's settings, or create new ones if they don't exist
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
          new: true,
        }
      );

      // Update the user's temporary voice channel name in settings
      userSetting.temporaryVoiceChannel.channelName = newNameOption;
      await userSetting.save();

      // Get the voice channel of the interacting member
      const userVoiceChannel = (interaction.member as GuildMember).voice
        .channel;
        
      // If the user is in a voice channel and it's their own temporary channel
      if (userVoiceChannel)
        if (checkOwnTempVoice(userVoiceChannel.id, interaction.user.id))
          await userVoiceChannel.setName(
            genericVariableReplacer(
              newNameOption,
              interaction.user,
              interaction.guild!,
              client
            )
          );

      // Send a success embed indicating the name has been changed
      interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title:
              "> <:colorrename:1387286560722128987> Changed Temporary Channel Name",
            description: `Changed to name: \`${newNameOption}\``,
          }),
        ],
      });

      return true;
    } catch (error) {
      handleInteractionError(interaction, error);

      return false;
    }
  },
  name: "voice-rename",
  description: "Change the name of your temporary voice channel",
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
