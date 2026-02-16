import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import MiniGameUserData from "../../models/UserMiniGameData";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const targetUserOption = interaction.options.getUser("target", true);
      const amountOption = interaction.options.getInteger("amount", true);

      if (targetUserOption.bot)
        throw new client.CustomError({
          name: "BotUser",
          message: "Bro think they can play mini game 💀🙏",
          type: "warning",
        });

      if (targetUserOption.id === interaction.user.id)
        throw new client.CustomError({
          name: "SelfTransfer",
          message: "You cannot transfer money to yourself.",
          type: "warning",
        });

      if (amountOption <= 0)
        throw new client.CustomError({
          name: "InvalidAmount",
          message: "You cannot transfer 0 or negative money.",
        });

      const senderMiniGameUserData = await MiniGameUserData.findOne({
        userId: interaction.user.id,
      });

      if (!senderMiniGameUserData)
        throw new client.CustomError({
          name: "NoAccount",
          message:
            "You don't have an account yet. Please use the daily command to create one.",
        });

      if (senderMiniGameUserData.balance < amountOption)
        throw new client.CustomError({
          name: "InsufficientBalance",
          message: "You don't have enough money to transfer.",
        });

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
          returnDocument: "after",
        },
      );

      senderMiniGameUserData.balance -= amountOption;
      targetMiniGameUserData.balance += amountOption;

      await senderMiniGameUserData.save();
      await targetMiniGameUserData.save();

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              "<:colorexchange:1387641945026728116> Transfer Successful",
            )
            .setDescription(
              `* <:colorcoin:1387339346889281596> **Amount**: ${amountOption} <:nyen:1373967798790783016>` +
                "\n" +
                `* <:colorwallet:1387275109844389928> **${interaction.user}'s New Balance**: ${senderMiniGameUserData.balance} <:nyen:1373967798790783016>` +
                "\n" +
                `* <:colorwallet:1387275109844389928> **${targetUserOption}'s New Balance**: ${targetMiniGameUserData.balance} <:nyen:1373967798790783016>`,
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
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  name: "transfer",
  description: "Transfer money to another user",
  disabled: false,
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
