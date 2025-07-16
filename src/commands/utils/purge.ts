import {
  ApplicationCommandOptionType,
  MessageFlags,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { CustomError } from "../../helpers/utils/CustomError";
import { handleInteractionError } from "../../helpers/utils/handleError";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const amountOption = interaction.options.getInteger("amount", true);

      // Validate the amount: it must be between 1 and 100
      if (amountOption < 1 || amountOption > 100)
        throw new CustomError({
          name: "InvalidNumber",
          message: "Can't set the value less than 1 or greater than 100",
          type: "warning",
        });

      // Perform bulk deletion of messages in the channel
      const deletedMessages = await (
        interaction.channel as TextChannel
      ).bulkDelete(amountOption);

      // Edit the deferred reply with a success message
      interaction.editReply(
        `> <:colortrashcan:1387287624632242327> Deleted ${deletedMessages.size} message.`
      );

      return true;
    } catch (error) {
      handleInteractionError(interaction, error);

      return false;
    }
  },
  name: "purge",
  description: "Delete the amount of message in this channel",
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "amount",
      description: "The amount to delete",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.ManageMessages],
  botPermissionsRequired: [PermissionFlagsBits.ManageMessages],
};

export default command;
