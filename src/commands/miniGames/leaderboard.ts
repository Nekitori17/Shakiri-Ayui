import _ from "lodash";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import UserMiniGameData from "../../models/UserMiniGameData";
import { createPageNavigationMenu } from "../../components/pageNavigationMenu";
import { CommandInterface } from "../../types/InteractionInterfaces";

interface LeaderboardData {
  userMention: string;
  longestStreak: number;
  coin: number;
  depositBankPercent: number;
}

const AMOUNT_USER_PER_PAGE = 25;

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      const sortBy = interaction.options.getString("sortBy", true);

      let userMiniGameData: any[] = [];

      switch (sortBy) {
        case "coin":
          userMiniGameData = await UserMiniGameData.aggregate([
            {
              $addFields: {
                totalCoin: { $add: ["$balance", "$bank.balance"] },
              },
            },
            {
              $sort: { totalCoin: -1 },
            },
          ]);
          break;

        case "longestStreak":
          userMiniGameData = await UserMiniGameData.find().sort({
            "daily.longestStreak": -1,
          });
          break;
      }

      if (!userMiniGameData.length) {
        await interaction.editReply("No leaderboard data found.");
        return true;
      }

      const users = await Promise.all(
        userMiniGameData.map((u) =>
          client.users.fetch(u.userId).catch(() => null),
        ),
      );

      const leaderboardData: LeaderboardData[] = userMiniGameData.map(
        (data, index) => {
          const user = users[index];

          const coin =
            sortBy === "coin"
              ? data.totalCoin
              : data.balance + data.bank.balance;

          const depositBankPercent = Number(
            (data.bank.balance / data.bank.capacity).toFixed(2),
          );

          return {
            userMention: user ? `<@${user.id}>` : "Unknown User",
            longestStreak: data.daily.longestStreak,
            coin,
            depositBankPercent,
          };
        },
      );

      const totalUsers = leaderboardData.length;
      const maxPages = Math.ceil(totalUsers / AMOUNT_USER_PER_PAGE) || 1;

      const leaderboardPages = _.chunk(leaderboardData, AMOUNT_USER_PER_PAGE);

      let currentPage = 0;

      const createReply = (page: number) => {
        const buttonsPageRow = createPageNavigationMenu(
          page,
          maxPages,
          "leaderboard",
        );

        const embed = new EmbedBuilder()
          .setColor("Aqua")
          .setAuthor({
            name:
              client.user?.displayName ||
              client.user?.username ||
              "Unknown User",
            iconURL: client.user?.displayAvatarURL(),
          })
          .setTitle("> <:glassleaderboard:1473645841934712913> LeaderBoard")
          .setDescription(
            leaderboardPages[page]
              .map((user, index) => {
                return (
                  ` * ${
                    AMOUNT_USER_PER_PAGE * page + index + 1
                  }. ${user.userMention}\n` +
                  `Longest Streak: ${user.longestStreak} 🔥\n` +
                  `Balance: ${user.coin} <:nyen:1373967798790783016> | Bank: ${user.depositBankPercent}%\n`
                );
              })
              .join("\n"),
          )
          .setFooter({
            text: `Page ${page + 1} of ${maxPages}`,
          });

        return {
          embeds: [embed],
          components: [buttonsPageRow],
        };
      };

      await interaction.editReply(createReply(currentPage));

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);
      return false;
    }
  },

  name: "leaderboard",
  description: "Show the leaderboard",
  options: [
    {
      name: "sortBy",
      description: "Select the metric to sort the leaderboard by",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: "Coin", value: "coin" },
        { name: "Longest Streak", value: "longestStreak" },
      ],
    },
  ],
  alias: ["lb"],
  disabled: false,
  deleted: false,
  devOnly: false,
  useInDm: true,
  requiredVoiceChannel: false,
};

export default command;
