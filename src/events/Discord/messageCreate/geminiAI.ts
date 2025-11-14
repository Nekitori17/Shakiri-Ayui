import config from "../../../config";
import fs from "fs";
import path from "path";
import { EmbedBuilder, Message } from "discord.js";
import CommonEmbedBuilder from "../../../helpers/embeds/commonEmbedBuilder";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const systemInstructionFile = fs.readFileSync(
  path.join(__dirname, "../../../../assets/gemini-system-instruction.txt"),
  {
    encoding: "utf-8",
  }
);

const event: DiscordEventInterface = async (client, msg: Message) => {
  // Ignore bot messages
  if (msg.author.bot) return;

  // Fetch guild settings for Gemini AI
  const guildSetting = await config.modules(msg.guildId!);

  // Check if Gemini AI is enabled and if the message is in the designated channel
  if (!guildSetting.geminiAI.enabled) return;
  if (msg.channelId !== guildSetting.geminiAI.channelSet) return;
  // Ignore messages starting with the ignore prefix
  if (msg.content.startsWith(guildSetting.geminiAI.ignorePrefix)) return;

  // Send a thinking message while waiting for the AI response
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

    // React with a success emoji
    msg.react("✅");

    // Edit the thinking message with the AI's response
    messageReply.edit({
      content: null,
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: msg.member?.displayName!,
            iconURL: msg.member?.displayAvatarURL(),
          })
          .setTitle("Gemini 2.5 Pro")
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
        CommonEmbedBuilder.error({
          title: error.name,
          description: error.message,
        }),
      ],
    });
  }
};

export default event;
