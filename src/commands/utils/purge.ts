import {
  ApplicationCommandOptionType,
  MessageFlags,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const amountOption = interaction.options.getInteger("amount", true);

      if (amountOption < 1 || amountOption > 100)
        throw new client.CustomError({
          name: "InvalidNumber",
          message: "Can't set the value less than 1 or greater than 100",
          type: "warning",
        });

      const deletedMessages = await (
        interaction.channel as TextChannel
      ).bulkDelete(amountOption);

      interaction.editReply(
        `> <:colortrashcan:1387287624632242327> Deleted ${deletedMessages.size} message.`,
      );

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  name: "purge",
  description: "Delete the amount of message in this channel",
  disabled: false,
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
