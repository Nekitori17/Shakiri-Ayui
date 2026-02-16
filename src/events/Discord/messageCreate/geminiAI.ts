import config from "../../../config";
import fs from "fs";
import path from "path";
import { EmbedBuilder, Message } from "discord.js";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const systemInstructionFile = fs.readFileSync(
  path.join(__dirname, "../../../../assets/gemini-system-instruction.txt"),
  {
    encoding: "utf-8",
  }
);

const event: DiscordEventInterface = async (client, msg: Message) => {
  if (msg.author.bot) return;

  const guildSetting = await client.getGuildSetting(msg.guildId!);

  if (!guildSetting.geminiAI.enabled) return;
  if (msg.channelId !== guildSetting.geminiAI.channelSet) return;
  if (msg.content.startsWith(guildSetting.geminiAI.ignorePrefix)) return;

  const messageReply = await msg.reply(
    "> <a:aithinking:1373927153313513512> Ayui is thinking..."
  );

  try {
    const apiResponse = await fetch(
      `${process.env.CUSTOM_URL_API_BASE}/endpoint?q=gemini-api`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GEMINI_AI_TOKEN}`,
        },
        body: JSON.stringify({
          input: msg.content,
          model: config.geminiAI.model,
          instruction: systemInstructionFile.toString(),
        }),
      }
    ).then((res) => res.json());

    msg.react("✅");

    messageReply.edit({
      content: null,
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: msg.member?.displayName!,
            iconURL: msg.member?.displayAvatarURL(),
          })
          .setTitle("Gemini 3 Pro Preview")
          .setThumbnail("https://files.catbox.moe/8xpwh3.png")
          .setDescription(apiResponse.text)
          .setFooter({
            text: msg.guild?.name!,
            iconURL: msg.guild?.iconURL()!,
          })
          .setColor("Random")
          .setTimestamp(),
      ],
    });
  } catch (error: any) {
    msg.react("❌");
    messageReply.edit({
      content: null,
      embeds: [
        client.CommonEmbedBuilder.error({
          title: error.name,
          description: error.message,
        }),
      ],
    });
  }
};

export default event;
