import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { sendError } from "../../utils/sendError";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const amount = interaction.options.get("amount")?.value as number;

    try {
      if (amount < 1 || amount > 100) {
        throw {
          name: "Invalid Number",
          message: "Can't set the value less than 1 or greater than 100",
        };
      }

      const deletedMessages = await (
        interaction.channel as TextChannel
      ).bulkDelete(amount);

      interaction.editReply(`> 🚮 Deleted ${deletedMessages.size} message.`);
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "purge",
  description: "Delete the amount of message in this channel",
  deleted: false,
  options: [
    {
      name: "amount",
      description: "The amount to delete",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageMessages],
  botPermissions: [PermissionFlagsBits.ManageMessages],
};

export default command;
