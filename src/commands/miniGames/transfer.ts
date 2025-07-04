import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import sendError from "../../helpers/utils/sendError";
import { CustomError } from "../../helpers/utils/CustomError";
import MiniGameUserData from "../../models/MiniGameUserData";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const targetUserOption = interaction.options.getUser("target", true);
      const amountOption = interaction.options.getInteger("amount", true);

      // Check if the user is a bot
      if (targetUserOption.bot)
        throw new CustomError({
          name: "BotUser",
          message: "Bro think they can play mini game 💀🙏",
          type: "warning",
        });

      // Check if the user is trying to transfer to themselves
      if (targetUserOption.id === interaction.user.id)
        throw new CustomError({
          name: "SelfTransfer",
          message: "You cannot transfer money to yourself.",
          type: "warning",
        });

      // Check if the amount is valid
      if (amountOption <= 0)
        throw new CustomError({
          name: "InvalidAmount",
          message: "You cannot transfer 0 or negative money.",
        });

      // Get sender mini game data
      const senderMiniGameUserData = await MiniGameUserData.findOne({
        userId: interaction.user.id,
      });

      // Check if sender has an account
      if (!senderMiniGameUserData)
        throw new CustomError({
          name: "NoAccount",
          message:
            "You don't have an account yet. Please use the daily command to create one.",
        });

      // Check if sender has enough balance
      if (senderMiniGameUserData.balance < amountOption)
        throw new CustomError({
          name: "InsufficientBalance",
          message: "You don't have enough money to transfer.",
        });

      // Get target mini game data
      const targetMiniGameUserData = await MiniGameUserData.findOneAndUpdate(
        {
          userId: targetUserOption.id,
        },
        {
          $setOnInsert: {
            userId: targetUserOption.id,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );

      // Transfer money
      senderMiniGameUserData.balance -= amountOption;
      targetMiniGameUserData.balance += amountOption;

      // Save changes
      await senderMiniGameUserData.save();
      await targetMiniGameUserData.save();

      // Send success message
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              "<:colorexchange:1387641945026728116> Transfer Successful"
            )
            .setDescription(
              `* <:colorcoin:1387339346889281596> **Amount**: ${amountOption} <:nyen:1373967798790783016>` +
                "\n" +
                `* <:colorwallet:1387275109844389928> **${interaction.user}'s New Balance**: ${senderMiniGameUserData.balance} <:nyen:1373967798790783016>` +
                "\n" +
                `* <:colorwallet:1387275109844389928> **${targetUserOption}'s New Balance**: ${targetMiniGameUserData.balance} <:nyen:1373967798790783016>`
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({
              text: client.user?.displayName!,
              iconURL: "https://files.catbox.moe/6j940t.gif",
            })
            .setTimestamp()
            .setColor("Green"),
        ],
      });

      return true;
    } catch (error) {
      sendError(interaction, error);

      return false;
    }
  },
  name: "transfer",
  description: "Transfer money to another user",
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "target",
      description: "The user to transfer money to",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "amount",
      description: "The amount of money to transfer",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  useInDm: false,
  requiredVoiceChannel: false,
};

export default command;
