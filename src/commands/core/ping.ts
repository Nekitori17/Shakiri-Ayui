import { Client, CommandInteraction } from "discord.js";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction: CommandInteraction, client: Client) {
    await interaction.reply("> ⌛ Pinging...");
    const reply = await interaction.fetchReply();
    const ping: number = reply.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(
      `> 🏓 Pong! Bot Latency is \`${ping}ms\` | API Latency is \`${client.ws.ping}\`ms.`
    )
  },
  name: "ping",
  description: "Get the bot's ping",
  deleted: false,
  canUseInDm: true
};

export default command
