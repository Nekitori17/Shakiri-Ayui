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
  WordleGameExeption,
  WordleGameStatus,
} from "../../logic/Wordle";
import sendError from "../../helpers/utils/sendError";
import MiniGameUserDatas from "../../models/MiniGameUserDatas";
import { CommandInterface } from "../../types/InteractionInterfaces";

const accentColorStatus: {
  [K in WordleGameStatus]: RGBTuple;
} = {
  playing: [255, 191, 0],
  won: [0, 255, 195],
  lost: [255, 0, 0],
};

function calculateReward(guessCount: number): number {
  const baseReward = 500;
  const penaltyPerGuess = 80;
  const reward = Math.max(baseReward - (guessCount - 1) * penaltyPerGuess, 50);
  return reward;
}

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      let wordleGame: WordleGame;

      const userDatas = await MiniGameUserDatas.findOneAndUpdate(
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
          new: true,
        }
      );

      if (userDatas.wordleGame) {
        wordleGame = new WordleGame();
        wordleGame.word = userDatas.wordleGame.word!;
        wordleGame.status = userDatas.wordleGame.status;
        wordleGame.guessed = userDatas.wordleGame.guessedWords;
        wordleGame.board = userDatas.wordleGame.board as any;
        wordleGame.wrongChars = userDatas.wordleGame.wrongChars;
      } else {
        wordleGame = new WordleGame();
        userDatas.wordleGame = {
          word: wordleGame.getWord(),
          status: wordleGame.status,
          board: wordleGame.getBoard() as any,
          wrongChars: wordleGame.getWrongChars(),
          guessedWords: wordleGame.getGuesses(),
        };
        await userDatas.save();
      }

      function generateWordleBoardDisplay(game: WordleGame) {
        const separatorComponent = new SeparatorBuilder();

        const gameTitleComponent = new TextDisplayBuilder().setContent(
          "## Wordle"
        );
        const todayDateComponent = new TextDisplayBuilder().setContent(
          `<:colorcalendar:1387276860735492237> **Date: ${new Date().toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          )}**`
        );
        const statusComponent = new TextDisplayBuilder().setContent(
          `<:colorok:1387277169817817209> **Status:** ${_.capitalize(
            game.status
          )}`
        );

        const wordleLogoComponent = new ThumbnailBuilder()
          .setURL("https://files.catbox.moe/vtppxo.png")
          .setDescription("Wordle Logo");

        const headerSection = new SectionBuilder()
          .addTextDisplayComponents(
            gameTitleComponent,
            todayDateComponent,
            statusComponent
          )
          .setThumbnailAccessory(wordleLogoComponent);

        const guessedLabelComponent = new TextDisplayBuilder().setContent(
          "<:colorrubikscube:1387280984592089179> **Guessed Words:** "
        );

        const guesses = game.getGuesses();
        const board = game.getBoard();

        let guessedWordComponents: SectionBuilder[] = [];

        for (let i = 0; i < 6; i++) {
          const guessWord = guesses[i] || "";
          const boardRow = board[i] || Array(5).fill("⬛");

          const displayWord = guessWord ? `**${guessWord}**` : `Guess ${i + 1}`;
          const displayBoard = boardRow.join("");

          guessedWordComponents.push(
            new SectionBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(displayWord)
              )
              .setButtonAccessory(
                new ButtonBuilder()
                  .setLabel(displayBoard || "⬛⬛⬛⬛⬛")
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId(`wordle-word-checkbox-${i}`)
              )
          );
        }

        const wrongCharsLabelComponent = new TextDisplayBuilder().setContent(
          "❌ **Wrong Letters:** "
        );

        const wrongChars = game.getWrongChars();
        const wrongCharsDisplay =
          wrongChars.length > 0
            ? wrongChars.map((char) => `**${char}**`).join(" ")
            : "None";

        const wrongCharsComponent = new TextDisplayBuilder().setContent(
          wrongCharsDisplay
        );

        let rewardComponent = null;
        if (game.status === "playing") {
          const potentialReward = calculateReward(game.getGuesses().length + 1);
          rewardComponent = new TextDisplayBuilder().setContent(
            `<:colorprize:1387281192096759828>**Potential Reward:** ${potentialReward} <:nyen:1373967798790783016> (Next guess)`
          );
        } else if (game.status === "won") {
          const earnedReward = calculateReward(game.getGuesses().length);
          rewardComponent = new TextDisplayBuilder().setContent(
            `🎉 **Earned Reward:** ${earnedReward} <:nyen:1373967798790783016>`
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

        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          guessButton,
          showAnswerButton
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
          .addActionRowComponents(actionRow);

        return container;
      }

      const sent = await interaction.editReply({
        flags: MessageFlags.IsComponentsV2,
        components: [generateWordleBoardDisplay(wordleGame)],
      });

      const collector = sent.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 3600000,
        filter: (i) => i.user.id === interaction.user.id,
      });

      collector.on("collect", async (buttonInteraction) => {
        if (buttonInteraction.customId.startsWith("wordle-word-checkbox-"))
          buttonInteraction.deferUpdate();

        try {
          if (buttonInteraction.customId == "wordle-guess-button") {
            // const cancelButton = new ButtonBuilder()
            //   .setCustomId("wordle-cancel-button")
            //   .setEmoji("❌")
            //   .setLabel("Cancel")
            //   .setStyle(ButtonStyle.Danger);

            // const actionRow =
            //   new ActionRowBuilder<ButtonBuilder>().addComponents(cancelButton);

            const sentButton = await buttonInteraction.reply({
              content:
                "<:coloridea:1387282119746785423> Enter the word to guess in the chat bar below within 10 seconds.",
              /* components: [actionRow],*/
            });

            let messageListenerActive = true;

            async function messageListener(message: Message) {
              if (!messageListenerActive) return;
              if (message.author.id != buttonInteraction.user.id) return;
              if (message.channelId != buttonInteraction.channelId) return;

              try {
                messageListenerActive = false;
                client.off("messageCreate", messageListener);

                if (message.deletable) await message.delete();
                try {
                  await sentButton.delete();
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
                    userDatas.balance += reward;
                  }
                }

                userDatas.wordleGame = {
                  word: wordleGame.getWord(),
                  status: wordleGame.status,
                  board: wordleGame.getBoard() as any,
                  wrongChars: wordleGame.getWrongChars(),
                  guessedWords: wordleGame.getGuesses(),
                };
                await userDatas.save();

                await sent.edit({
                  components: [generateWordleBoardDisplay(wordleGame)],
                });

                if (gameEnded && wordleGame.status === "won") {
                  await buttonInteraction.followUp({
                    content: `🎉 Congratulations! You earned **${reward} nyen** for solving it in ${
                      wordleGame.getGuesses().length
                    } guesses!`,
                    flags: MessageFlags.Ephemeral,
                  });
                }
              } catch (error) {
                if (error instanceof WordleGameExeption) {
                  await buttonInteraction.followUp({
                    content: error.message,
                    flags: MessageFlags.Ephemeral,
                  });
                } else {
                  sendError(buttonInteraction, error);
                }
              }
            }

            client.on("messageCreate", messageListener);

            // const buttonCollector = sentButton.createMessageComponentCollector({
            //   componentType: ComponentType.Button,
            //   time: 10000,
            //   filter: (i) => i.user.id === buttonInteraction.user.id,
            // });

            // buttonCollector.on("collect", async (cancelButtonInteraction) => {
            //   console.log("cancel");
            //   if (cancelButtonInteraction.customId == "wordle-cancel-button") {
            //     messageListenerActive = false;
            //     client.off("messageCreate", messageListener);
            //     cancelButtonInteraction.deferUpdate();
            //   }
            // });

            setTimeout(async () => {
              messageListenerActive = false;
              client.off("messageCreate", messageListener);
              try {
                await sentButton.delete();
              } catch {}
            }, 10000);
          }

          if (buttonInteraction.customId == "wordle-show-answer-button") {
            await buttonInteraction.user.send(
              `🥁 The answer today is ||**${wordleGame.getWord()}**||`
            );
            buttonInteraction.deferUpdate();
          }
        } catch (error) {
          sendError(buttonInteraction, error);
        }
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "wordle",
  description: "Get 6 chances to guess a 5-letter word.",
  deleted: false,
};

export default command;
