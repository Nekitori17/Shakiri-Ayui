import axios from "axios";
import config from "../../../config";
import { EmbedBuilder, Message } from "discord.js";
import CommonEmbedBuilder from "../../../helpers/commonEmbedBuilder";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (client, msg: Message) => {
  if (msg.author.bot) return;

  const settings = await config.modules(msg.guildId!);
  if (!settings.geminiAI.enabled) return;
  if (msg.channelId !== settings.geminiAI.channelSet) return;
  if (msg.content.startsWith(settings.geminiAI.ignorePrefix)) return;

  const sent = await msg.reply(
    "> <a:aithinking:1373927153313513512> Ayui is thinking..."
  );

  try {
    const response = await axios
      .post(
        `${process.env.CUSTOM_URL_API_BASE}/endpoint`,
        {
          input: msg.content,
          model: "gemini-2.5-flash-preview-04-17",
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
      .then((res) => res.data)
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
          .setTitle("Gemini 2.5 Flash preview 04-17")
          .setThumbnail("https://files.catbox.moe/8xpwh3.png")
          .setDescription(response.text)
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
