import {
  ApplicationCommandOptionType,
  Client,
  CommandInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { CommandInterface } from "../../types/InteractionInterfaces";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";

const command: CommandInterface = {
  async execute(interaction: CommandInteraction, client: Client) {
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

      interaction.editReply(`> 🚮 Deleted ${deletedMessages.size} message.`)
    } catch (error: { name: string; message: string } | any) {
      await interaction.deleteReply();
      (interaction.channel as TextChannel)?.send({
        embeds: [
          CommonEmbedBuilder.error({
            title: error.name,
            description: error.message,
          }),
        ],
      });
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
