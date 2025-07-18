import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { CustomError } from "../../helpers/utils/CustomError";
import { handleInteractionError } from "../../helpers/utils/handleError";
import MiniGameUserData from "../../models/MiniGameUserData";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const amountOption = interaction.options.getInteger("amount", true);

      // Check the value is valid
      if (amountOption <= 0) 
        throw new CustomError({
          name: "InvalidAmount",
          message: "You cannot deposit a negative or zero amount.",
          type: "warning",
        });
      

      // Get mini game data of user
      const miniGameUserData = await MiniGameUserData.findOne(
        {
          userId: interaction.user.id,
        }
      );

      // Check if sender or receiver has an account.
            if (!miniGameUserData)
              throw new CustomError({
                name: "NoAccount",
                message: `You do not have a balance yet.`,
              });

      // Check if the user has enough balance
      if (miniGameUserData.balance < amountOption)
        throw new CustomError({
          name: "InsufficientBalance",
          message: "You don't have enough coins in your balance to deposit.",
          type: "warning",
        });

      // Check if the bank has enough capacity
      if (
        miniGameUserData.bank.balance + amountOption >
        miniGameUserData.bank.capacity
      )
        throw new CustomError({
          name: "BankCapacityExceeded",
          message: `Your bank does not have enough capacity to hold this amount. Your current capacity is ${miniGameUserData.bank.capacity} and you are trying to deposit ${amountOption}.`,
          type: "warning",
        });

      // Update balance and bank balance
      miniGameUserData.balance -= amountOption;
      miniGameUserData.bank.balance += amountOption;
      await miniGameUserData.save();

      // Send success message
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              `> <:colorrequestmoney:1387339020597727313> ${interaction.user.displayName}'s Deposit`
            )
            .setDescription(
              `* <:colorcoin:1387339346889281596> **Amount**: ${amountOption} <:nyen:1373967798790783016>` +
                "\n" +
                `* <:colorwallet:1387275109844389928> **New Balance**: ${miniGameUserData.balance} <:nyen:1373967798790783016>` +
                "\n" +
                `* <:colorbank:1387275317076562000> **New Bank Balance**: ${miniGameUserData.bank.balance}/${miniGameUserData.bank.capacity} <:nyen:1373967798790783016>`
            )
            .setColor("Aqua")
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({
              text: client.user?.displayName!,
              iconURL: "https://files.catbox.moe/6j940t.gif",
            })
            .setTimestamp(),
        ],
      });

      return true;
    } catch (error) {
      handleInteractionError(interaction, error);

      return false;
    }
  },
  alias: "dp",
  name: "deposit",
  description: "Deposit your coins into the bank.",
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "amount",
      description: "The amount of coins you want to deposit.",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  cooldown: 300,
  useInDm: true,
  requiredVoiceChannel: false,
};

export default command;
