import path from "path";
import {
  ActionRowBuilder,
  Client,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { CommandInterface } from "../../types/InteractionInterfaces";
import { commandCategories } from "../../data/commandCategories";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";
import getAllFiles from "../../utils/getAllFiles";

const command: CommandInterface = {
  async execute(interaction: CommandInteraction, client: Client) {
    await interaction.deferReply();

    try {
      const commandListMenuDropdown = Object.entries(commandCategories).map(
        ([category, { label, emoji }]) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(label)
            .setValue(category)
            .setEmoji(emoji)
      );

      const selectMenu =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(interaction.id)
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder("Select a category")
            .addOptions(commandListMenuDropdown)
        );

      function commandListEmbed(category: string): EmbedBuilder {
        const commandCategory =
          commandCategories[category as keyof typeof commandCategories];
        return new EmbedBuilder()
          .setAuthor({
            name: interaction.user.displayName,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTitle(`> ${commandCategory.emoji} ${commandCategory.label}`)
          .setDescription(
            getAllFiles(path.join(__dirname, "..", category))
              .map(
                (file) =>
                  `* </${
                    (require(file) as { default: CommandInterface }).default
                      .name
                  }:0>`
              )
              .join("\n")
          )
          .setFooter({
            text: interaction.guild?.name || "",
            iconURL: interaction.guild?.iconURL() || "",
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
                `* <:owner:1309527278090457178>  The Official Bot For Nameless Realm Server.` +
                "\n" +
                `* <:code:1309526212544036986>  Code By Nekitori17.` +
                "\n" +
                `* <:card:1309526027663442001>  Host by: sillydev.co.uk` +
                "\n" +
                `* <:share:1309527583695699968>  Source Code: https://github.com/Nekitori17/Shakiri-Ayui` +
                "\n"
            )
            .setFooter({
              text: interaction.guild?.name || "",
              iconURL: interaction.guild?.iconURL() || "",
            })
            .setTimestamp()
            .setColor("Aqua"),
        ],
        components: [selectMenu],
      });

      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i) =>
          i.user.id == interaction.user.id && i.customId == interaction.id,
        time: 60_000,
      });

      collector.on("collect", async (inter) => {
        if (!inter.values.length) return;

        await reply.edit({
          embeds: [commandListEmbed(inter.values[0])],
        });
        inter.deferUpdate();
      });
    } catch (error: { name: string; message: string } | any) {
      interaction.editReply({
        content: null,
        components: undefined,
        files: undefined,
        attachments: undefined,
        embeds: [
          CommonEmbedBuilder.error({
            title: error.name,
            description: error.message,
          }),
        ],
      });
    }
  },
  name: "help",
  description: "Get list command of the bot",
  deleted: false,
  canUseInDm: true,
};

export default command;
