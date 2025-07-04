import path from "path";
import {
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import getAllFiles from "../../helpers/utils/getAllFiles";
import sendError from "../../helpers/utils/sendError";
import { commandCategories } from "../../constants/commandCategories";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      // Create dropdown menu to select command category
      const commandCategoriesSelectMenuOption = Object.entries(
        commandCategories
      ).map(([category, { label, emoji, description }]) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(label)
          .setValue(category)
          .setEmoji(emoji)
          .setDescription(description)
      );

      const commandCategoriesSelectMenuRow =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`help-menu-${interaction.id}`)
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder("Select a category")
            .addOptions(commandCategoriesSelectMenuOption)
        );

      /**
       * Generates an EmbedBuilder containing a list of commands for a given category.
       * @param category The category of commands to list.
       * @returns An EmbedBuilder object.
       */
      function commandListEmbed(category: string) {
        const commandCategory =
          commandCategories[category as keyof typeof commandCategories];

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
          .setTitle(`> ${commandCategory.emoji} ${commandCategory.label}`)
          .setDescription(commands.join("\n"))
          .setFooter({
            text: interaction.guild?.name || client.user?.displayName!,
            iconURL:
              interaction.guild?.iconURL() || client.user?.displayAvatarURL(),
          })
          .setTimestamp()
          .setColor("Aqua");
      }

      // Send main embed with dropdown menu
      const helpEmbedReply = await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: interaction.user.displayName,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`> 💻 Command Categories`)
            .setDescription(
              `\`\`\` Please use the Select Menu below to explore the corresponding category \`\`\`` +
                "\n\n" +
                `**Bot Info**:` +
                "\n" +
                `* <:colorbot:1387267699133911051> Small bot with **some utilities.**` +
                "\n" +
                `* <:colorundercomputer:1387268012599672852>  Code By **[Nekitori17](https://github.com/Nekitori17).**` +
                "\n" +
                `* <:colorserver:1387268206078591046>  Host by: \`sillydev.co.uk\`` +
                "\n" +
                `* <:colorsourcecode:1387267855937966152> Source Code: __https://github.com/Nekitori17/Shakiri-Ayui__` +
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
        components: [commandCategoriesSelectMenuRow],
      });

      // Create a collector to listen to dropdown select.
      const helpEmbedCollector = helpEmbedReply.createMessageComponentCollector(
        {
          componentType: ComponentType.StringSelect,
          filter: (i) =>
            i.user.id == interaction.user.id &&
            i.customId == `help-menu-${interaction.id}`,
          time: 60_000,
        }
      );

      helpEmbedCollector.on(
        "collect",
        async (menuCategoriesSelectInteraction) => {
          if (!menuCategoriesSelectInteraction.values.length) return;

          // Replace old embed with new embed, which has a list of commands. In the category user, which was selected?
          await helpEmbedReply.edit({
            embeds: [
              commandListEmbed(menuCategoriesSelectInteraction.values[0]),
            ],
          });
          menuCategoriesSelectInteraction.deferUpdate();
        }
      );

      return true;
    } catch (error) {
      sendError(interaction, error);
      
      return false;
    }
  },
  alias: "h",
  name: "help",
  description: "Get list command of the bot",
  deleted: false,
  devOnly: false,
  useInDm: true,
  requiredVoiceChannel: false,
};

export default command;
