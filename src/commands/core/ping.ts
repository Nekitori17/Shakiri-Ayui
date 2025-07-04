import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.reply("> ⌛ Pinging...");
    const reply = await interaction.fetchReply();

    // Calculate latency
    const ping = reply.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(
      `> 🏓 Pong! Bot Latency is \`${ping}ms\` | API Latency is \`${client.ws.ping}\`ms.`
    );

    return true;
  },
  name: "ping",
  description: "Get the bot's ping",
  deleted: false,
  devOnly: false,
  useInDm: true,
  requiredVoiceChannel: false,
};

export default command;
