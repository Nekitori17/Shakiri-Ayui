import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import MiniGameUserDatas from "../../models/MiniGameUserDatas";
import sendError from "../../helpers/utils/sendError";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const userTarget = interaction.options.get("user")?.value as string;

    try {
      if (userTarget && (await client.users.fetch(userTarget)).bot)
        throw {
          name: "BotUser",
          message: "Bro think they can play minigame 💀🙏",
          type: "warning",
        };

      const userDatas = await MiniGameUserDatas.findOneAndUpdate(
        {
          userId: userTarget || interaction.user.id,
        },
        {
          $setOnInsert: {
            userId: userTarget || interaction.user.id,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );

      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              `> <:colorcoin:1387339346889281596> ${
                userTarget
                  ? client.users.cache.get(userTarget)?.displayName ||
                    "Unknown User"
                  : interaction.user.displayName
              }'s Balance`
            )
            .setDescription(
              `* <:colorfire:1387269037830049994> **Daily Streak**: ${userDatas.dailyStreak} days` +
                "\n" +
                `* <:colorcampfire:1387274928981676165> **Longest Streak**: ${userDatas.longestStreak} days` +
                "\n" +
                `* <:colorwallet:1387275109844389928> Balance: ${
                  userDatas?.balance || 0
                } <:nyen:1373967798790783016>` +
                "\n" +
                `* <:colorbank:1387275317076562000> **Bank**: ${userDatas.bank.balance}/${userDatas.bank.capacity} <:nyen:1373967798790783016>` +
                "\n" +
                `* <:coloreconomicimprovement:1387275487637803039> **Interest Rate**: ${
                  userDatas.bank.interestRate * 100
                }%`
            )
            .setColor("Aqua")
            .setThumbnail(
              (userTarget
                ? client.users.cache.get(userTarget)?.displayAvatarURL()
                : interaction.user.displayAvatarURL())!
            )
            .setFooter({
              text: client.user?.displayName!,
              iconURL: "https://files.catbox.moe/6j940t.gif",
            })
            .setTimestamp(),
        ],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "balance",
  description: "Check your balance or someone else's balance",
  deleted: false,
  options: [
    {
      name: "user",
      description: "The user to check the balance of",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  canUseInDm: true,
};

export default command;
