import { Client, EmbedBuilder, Message } from "discord.js";
import { DiscordEventInterface } from "../../../types/EventInterfaces";
import config from "../../../config";
import axios from "axios";
import CommonEmbedBuilder from "../../../utils/commonEmbedBuilder";

const event: DiscordEventInterface = async (
  client: Client,
  msg: Message
) => {
  if (msg.author.bot) return;

  const settings = await config.modules(msg.guildId!)
  if (!settings.geminiAI?.enabled) return;
  if (msg.channelId !== settings.geminiAI?.channelSet) return;
  if (msg.content.startsWith(settings.geminiAI?.ignorePrefix)) return;

  const sent = await msg.reply("> 💭 Ayui is thinking...");

  try {
    const response = await axios
      .post(
        `${process.env.CUSTOM_URL_API_BASE}/endpoint`,
        {
          input: msg.content,
          model: "gemini-1.5-pro-latest",
        },
        {
          params: {
            q: "gemini-api",
          },
          headers: {
            Authorization: process.env.GEMINI_AI_TOKEN,
          },
        }
      )
      .then((res) => res.data.output)
      .catch((err) => {
        throw {
          name: err.response.statusText,
          message: err.response.data.error,
        };
      });

    msg.react("✅");

    sent.edit({
      content: null,
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: msg.member?.displayName!,
            iconURL: msg.member?.displayAvatarURL(),
          })
          .setTitle("Gemini 1.5 Pro Latest")
          .setThumbnail("https://files.catbox.moe/8xpwh3.png")
          .setDescription(response)
          .setFooter({
            text: msg.guild?.name!,
            iconURL: msg.guild?.iconURL()!,
          })
          .setColor("Random")
          .setTimestamp(),
      ],
    });
  } catch (error: { name: string; message: string } | any) {
    msg.react("❌");
    sent.edit({
      content: null,
      embeds: [
        CommonEmbedBuilder.error({
          title: error.name,
          description: error.message,
        }),
      ],
    });
  }
};

export default event;
