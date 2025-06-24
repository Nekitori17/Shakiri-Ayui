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
              `> ${
                userTarget
                  ? client.users.cache.get(userTarget)?.displayName ||
                    "Unknown User"
                  : interaction.user.displayName
              }'s Balance`
            )
            .setDescription(
              `<:neonfire:1387053968340942898> Daily Streak: ${userDatas.dailyStreak} days` +
                "\n" +
                `<:neoncampfire:1387054129204953118> Longest Streak: ${userDatas.longestStreak} days` +
                "\n" +
                `<:neonwallet:1387054333333471242> Balance: ${
                  userDatas?.balance || 0
                } <:nyen:1373967798790783016>` +
                "\n" +
                `<:neonbank:1387054510861586572> Bank: ${userDatas.bank.balance}/${userDatas.bank.capacity} <:nyen:1373967798790783016>` +
                "\n" +
                `<:neoneconomicimprovement:1387054670278688888> Profit: ${
                  userDatas.bank.profit * 100
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
