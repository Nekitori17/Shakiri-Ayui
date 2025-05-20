import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import UserDatas from "../../models/UserDatas";
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
          message: "Bro think they's a humman 💀🙏",
          type: "warning",
        };

      const userDatas = await UserDatas.findOneAndUpdate(
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
                  ? client.users.cache.get(userTarget) || "Unknown User"
                  : interaction.user
              }'s Balance`
            )
            .setDescription(
              `🔥 Daily Streak: ${userDatas.dailyStreak} days` +
                "\n" +
                `💵 Balance: ${
                  userDatas?.balance || 0
                } <:nyen:1373967798790783016>` +
                "\n" +
                `🏦 Bank: ${userDatas.bank.balance}/${userDatas.bank.capacity} <:nyen:1373967798790783016>` +
                "\n" +
                `📈 Profit: ${userDatas.bank.profit * 100}%`
            )
            .setColor("Aqua")
            .setThumbnail(
              (userTarget
                ? client.users.cache.get(userTarget)?.displayAvatarURL()
                : interaction.user.displayAvatarURL())!
            )
            .setFooter({
              text: client.user?.displayName!,
              iconURL: "https://files.catbox.moe/fw1c0d.gif",
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
