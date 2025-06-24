import path from "path";
import {
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
  Emoji,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import getAllFiles from "../../helpers/utils/getAllFiles";
import sendError from "../../helpers/utils/sendError";
import { commandCategories } from "../../constants/commandCategories";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const commandListMenuDropdown = Object.entries(commandCategories).map(
        ([category, { label, emoji, description }]) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(label)
            .setValue(category)
            .setEmoji(emoji)
            .setDescription(description)
      );

      const selectMenu =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`help-menu-${interaction.id}`)
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder("Select a category")
            .addOptions(commandListMenuDropdown)
        );

      function commandListEmbed(category: string): EmbedBuilder {
        const commandCategory =
          commandCategories[category as keyof typeof commandCategories];
        let categoryEmoji: string | Emoji = commandCategory.emoji;

        if (!isNaN(Number(categoryEmoji))) {
          const emojiFromBot = client.emojis.cache.get(categoryEmoji);
          categoryEmoji = emojiFromBot || categoryEmoji;
        }

        const commands = getAllFiles(path.join(__dirname, "..", category)).map(
          (file) => {
            const command = require(file).default as CommandInterface;
            return `🔹 </${command.name}:0>`;
          }
        );

        return new EmbedBuilder()
          .setAuthor({
            name: interaction.user.displayName,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTitle(`> ${categoryEmoji} ${commandCategory.label}`)
          .setDescription(commands.join("\n"))
          .setFooter({
            text: interaction.guild?.name || client.user?.displayName!,
            iconURL:
              interaction.guild?.iconURL() || client.user?.displayAvatarURL(),
          })
          .setTimestamp()
          .setColor("Aqua");
      }

      const reply = await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: interaction.user.displayName,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`> 💻 Command Categories`)
            .setDescription(
              `\`\`\` Please use the Select Menu below to explore the corresponding category \`\`\`` +
                "\n" +
                `**Bot Info**:` +
                "\n" +
                `* 💠 Small bot with **some utilities.**` +
                "\n" +
                `* 💠  Code By **[Nekitori17](https://github.com/Nekitori17).**` +
                "\n" +
                `* 💠  Host by: \`sillydev.co.uk\`` +
                "\n" +
                `* 💠  Source Code: __https://github.com/Nekitori17/Shakiri-Ayui__` +
                "\n"
            )
            .setFooter({
              text: interaction.guild?.name || client.user?.displayName!,
              iconURL:
                interaction.guild?.iconURL() || client.user?.displayAvatarURL(),
            })
            .setTimestamp()
            .setColor("Aqua"),
        ],
        components: [selectMenu],
      });

      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i) =>
          i.user.id == interaction.user.id &&
          i.customId == `help-menu-${interaction.id}`,
        time: 60_000,
      });

      collector.on("collect", async (inter) => {
        if (!inter.values.length) return;

        await interaction.editReply({
          embeds: [commandListEmbed(inter.values[0])],
        });
        inter.deferUpdate();
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "help",
  description: "Get list command of the bot",
  deleted: false,
  canUseInDm: true,
};

export default command;
