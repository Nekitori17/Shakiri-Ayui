import { Client, CommandInteraction } from "discord.js";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction: CommandInteraction, client: Client) {},
  name: "help",
  description: "Get list command of the bot",
  deleted: false,
  canUseInDm: true
};

export default command;
