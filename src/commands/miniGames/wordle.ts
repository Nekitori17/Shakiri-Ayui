import _ from "lodash";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ContainerBuilder,
  Message,
  MessageFlags,
  RGBTuple,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
} from "discord.js";
import WordleGame, {
  WordleGameException,
  WordleGameStatus,
} from "../../classes/Wordle";
import UserMiniGameData from "../../models/UserMiniGameData";
import UserWordleGameData from "../../models/miniGames/WordleGame";
import { CommandInterface } from "../../types/InteractionInterfaces";

// Defines the accent color for the embed based on the game status.
const accentColorStatus: {
  [K in WordleGameStatus]: RGBTuple;
} = {
  playing: [255, 191, 0], // Amber
  won: [0, 255, 195], // Green
  lost: [255, 0, 0], // Red
};

function calculateReward(guessCount: number) {
  const baseReward = 500;
  const penaltyPerGuess = 80;
  // The reward is the base reward minus a penalty for each guess after the first.
  // The minimum reward is 50.
  const reward = Math.max(baseReward - (guessCount - 1) * penaltyPerGuess, 50);
  return reward;
}

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      let wordleGame: WordleGame;

      const userWordleGameData = await UserWordleGameData.findOneAndUpdate(
        {
          userId: interaction.user.id,
        },
        {
          $setOnInsert: {
            userId: interaction.user.id,
          },
        },
        {
          upsert: true,
          returnDocument: "after",
        },
      );
      const userMiniGameData = await UserMiniGameData.findOneAndUpdate(
        {
          userId: interaction.user.id,
        },
        {
          $setOnInsert: {
            userId: interaction.user.id,
          },
        },
        {
          upsert: true,
          returnDocument: "after",
        },
      );

      if (userWordleGameData.status === "playing") {
        wordleGame = new WordleGame();
        wordleGame.date = userWordleGameData.date as Date;
        wordleGame.word = userWordleGameData.word!;
        wordleGame.status = userWordleGameData.status;
        wordleGame.guessed = userWordleGameData.guessedWords;
        wordleGame.board = userWordleGameData.board as any;
        wordleGame.wrongChars = userWordleGameData.wrongChars;
      } else {
        wordleGame = new WordleGame();
        userWordleGameData.date = wordleGame.date;
        userWordleGameData.word = wordleGame.getWord();
        userWordleGameData.status = wordleGame.status;
        userWordleGameData.board = wordleGame.getBoard() as any;
        userWordleGameData.wrongChars = wordleGame.getWrongChars();
        userWordleGameData.guessedWords = wordleGame.getGuesses();
        await userWordleGameData.save();
      }

      function generateWordleBoardDisplay(game: WordleGame) {
        const separatorComponent = new SeparatorBuilder();

        const gameTitleComponent = new TextDisplayBuilder().setContent(
          "## Wordle",
        );
        const dateComponent = new TextDisplayBuilder().setContent(
          `<:colorcalendar:1387276860735492237> **Date: ${game.date.toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            },
          )}**`,
        );
        const statusComponent = new TextDisplayBuilder().setContent(
          `<:colorok:1387277169817817209> **Status:** ${_.capitalize(
            game.status,
          )}`,
        );

        const wordleLogoComponent = new ThumbnailBuilder()
          .setURL("https://files.catbox.moe/vtppxo.png")
          .setDescription("Wordle Logo");

        const headerSection = new SectionBuilder()
          .addTextDisplayComponents(
            gameTitleComponent,
            dateComponent,
            statusComponent,
          )
          .setThumbnailAccessory(wordleLogoComponent);

        const guessedLabelComponent = new TextDisplayBuilder().setContent(
          "<:colorrubikscube:1387280984592089179> **Guessed Words:** ",
        );

        const guesses = game.getGuesses();
        const board = game.getBoard();

        let guessedWordComponents: SectionBuilder[] = [];

        // Create a row for each of the 6 possible guesses
        for (let i = 0; i < 6; i++) {
          const guessWord = guesses[i] || "";
          const boardRow = board[i] || Array(5).fill("⬛");

          const displayWord = guessWord ? `**${guessWord}**` : `Guess ${i + 1}`;
          const displayBoard = boardRow.join("");

          guessedWordComponents.push(
            new SectionBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(displayWord),
              )
              .setButtonAccessory(
                new ButtonBuilder()
                  .setLabel(displayBoard || "⬛⬛⬛⬛⬛")
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId(`wordle-word-checkbox-${i}`),
              ),
          );
        }

        const wrongCharsLabelComponent = new TextDisplayBuilder().setContent(
          "❌ **Wrong Letters:** ",
        );

        const wrongChars = game.getWrongChars();
        const wrongCharsDisplay =
          wrongChars.length > 0
            ? wrongChars.map((char) => `**${char}**`).join(" ")
            : "None";

        const wrongCharsComponent = new TextDisplayBuilder().setContent(
          wrongCharsDisplay,
        );

        let rewardComponent = null;
        if (game.status === "playing") {
          const potentialReward = calculateReward(game.getGuesses().length + 1);
          rewardComponent = new TextDisplayBuilder().setContent(
            `<:colorprize:1387281192096759828>**Potential Reward:** ${potentialReward} <:nyen:1373967798790783016> (Next guess)`,
          );
        } else if (game.status === "won") {
          const earnedReward = calculateReward(game.getGuesses().length);
          rewardComponent = new TextDisplayBuilder().setContent(
            `🎉 **Earned Reward:** ${earnedReward} <:nyen:1373967798790783016>`,
          );
        }

        const guessButton = new ButtonBuilder()
          .setCustomId("wordle-guess-button")
          .setEmoji("1387281520594653204")
          .setLabel("Guess")
          .setStyle(ButtonStyle.Success)
          .setDisabled(game.status != "playing");
        const showAnswerButton = new ButtonBuilder()
          .setCustomId("wordle-show-answer-button")
          .setEmoji("1387281699859070976")
          .setLabel("Show Answer")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(game.status == "playing");

        const actionButtonRow =
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            guessButton,
            showAnswerButton,
          );

        const container = new ContainerBuilder()
          .addSectionComponents(headerSection)
          .addSeparatorComponents(separatorComponent)
          .addTextDisplayComponents(guessedLabelComponent)
          .addSectionComponents(guessedWordComponents)
          .addSeparatorComponents(separatorComponent)
          .addTextDisplayComponents(wrongCharsLabelComponent)
          .addTextDisplayComponents(wrongCharsComponent);

        if (rewardComponent) {
          container
            .addSeparatorComponents(separatorComponent)
            .addTextDisplayComponents(rewardComponent);
        }

        container
          .setAccentColor(accentColorStatus[game.status])
          .addActionRowComponents(actionButtonRow);

        return container;
      }

      const wordleGameReply = await interaction.editReply({
        flags: MessageFlags.IsComponentsV2,
        components: [generateWordleBoardDisplay(wordleGame)],
      });

      const wordleGameCollector =
        wordleGameReply.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 3600000,
          filter: (i) => i.user.id === interaction.user.id, // Only collect from the original user
        });

      wordleGameCollector.on(
        "collect",
        async (wordleActionButtonInteraction) => {
          // Ignore clicks on the decorative board buttons
          if (
            wordleActionButtonInteraction.customId.startsWith(
              "wordle-word-checkbox-",
            )
          )
            wordleActionButtonInteraction.deferUpdate();

          try {
            if (
              wordleActionButtonInteraction.customId == "wordle-guess-button"
            ) {
              await wordleActionButtonInteraction.deferReply();

              const cancelGuessButton = new ButtonBuilder()
                .setCustomId("wordle-cancel-button")
                .setEmoji("❌")
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Danger);

              const cancelButtonRow =
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                  cancelGuessButton,
                );

              const guessMessageReply =
                await wordleActionButtonInteraction.editReply({
                  content:
                    "<:coloridea:1387282119746785423> Enter the word to guess in the chat bar below within 10 seconds.",
                  components: [cancelButtonRow],
                });

              let messageListenerActive = true;
              async function guessMessageListener(message: Message) {
                if (!messageListenerActive) return;
                if (message.author.id != wordleActionButtonInteraction.user.id)
                  return;
                if (
                  message.channelId != wordleActionButtonInteraction.channelId
                )
                  return;

                try {
                  messageListenerActive = false;
                  client.off("messageCreate", guessMessageListener);

                  if (message.deletable) await message.delete();
                  try {
                    await guessMessageReply.delete();
                  } catch {}

                  const guess = message.content;
                  const previousStatus = wordleGame.status;
                  wordleGame.guess(guess);

                  const gameEnded =
                    previousStatus === "playing" &&
                    wordleGame.status !== "playing";
                  let reward = 0;

                  if (gameEnded) {
                    if (wordleGame.status === "won") {
                      reward = calculateReward(wordleGame.getGuesses().length);
                      userMiniGameData.balance += reward;
                    }
                  }

                  userWordleGameData.date = wordleGame.date;
                  userWordleGameData.word = wordleGame.getWord();
                  userWordleGameData.status = wordleGame.status;
                  userWordleGameData.board = wordleGame.getBoard() as any;
                  userWordleGameData.wrongChars = wordleGame.getWrongChars();
                  userWordleGameData.guessedWords = wordleGame.getGuesses();
                  await userWordleGameData.save();

                  await wordleGameReply.edit({
                    components: [generateWordleBoardDisplay(wordleGame)],
                  });

                  if (gameEnded && wordleGame.status === "won") {
                    await wordleActionButtonInteraction.followUp({
                      content: `🎉 Congratulations! You earned **${reward} nyen** for solving it in ${
                        wordleGame.getGuesses().length
                      } guesses!`,
                      flags: MessageFlags.Ephemeral,
                    });
                  }
                } catch (error) {
                  if (error instanceof WordleGameException) {
                    await wordleActionButtonInteraction.followUp({
                      content: error.message,
                      flags: MessageFlags.Ephemeral,
                    });
                  } else {
                    client.interactionErrorHandler(
                      wordleActionButtonInteraction,
                      error,
                    );
                  }
                }
              }

              client.on("messageCreate", guessMessageListener);

              const guessMessageCollector =
                guessMessageReply.createMessageComponentCollector({
                  componentType: ComponentType.Button,
                  time: 10000,
                  filter: (i) =>
                    i.user.id === wordleActionButtonInteraction.user.id,
                });

              guessMessageCollector.on(
                "collect",
                async (cancelButtonInteraction) => {
                  if (
                    cancelButtonInteraction.customId == "wordle-cancel-button"
                  ) {
                    messageListenerActive = false;
                    client.off("messageCreate", guessMessageListener);
                    try {
                      await guessMessageReply.delete();
                    } catch {}
                    cancelButtonInteraction.deferUpdate();
                  }
                },
              );

              setTimeout(async () => {
                if (!messageListenerActive) return; // Already handled
                messageListenerActive = false;
                client.off("messageCreate", guessMessageListener);
                try {
                  await guessMessageReply.delete();
                } catch {}
              }, 10000);
            }

            if (
              wordleActionButtonInteraction.customId ==
              "wordle-show-answer-button"
            ) {
              await wordleActionButtonInteraction.user.send(
                `🥁 The answer today is ||**${wordleGame.getWord()}**||`,
              );
              wordleActionButtonInteraction.deferUpdate();
            }
          } catch (error) {
            client.interactionErrorHandler(
              wordleActionButtonInteraction,
              error,
            );
          }
        },
      );

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  alias: ["wl"],
  name: "wordle",
  description: "Get 6 chances to guess a 5-letter word.",
  deleted: false,
  devOnly: false,
  disabled: false,
  useInDm: true,
  requiredVoiceChannel: false,
};

export default command;
