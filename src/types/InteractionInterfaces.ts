import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonInteraction,
  Client,
  CommandInteraction,
  MessageContextMenuCommandInteraction,
  StringSelectMenuInteraction,
  UserContextMenuCommandInteraction,
} from "discord.js";

export interface CommandInterface {
  execute: (interaction: CommandInteraction, client: Client) => void;
  name: string;
  description: string;
  deleted: boolean;
  options?: {
    name: string;
    description: string;
    type: ApplicationCommandOptionType;
    required: boolean;
    choices?: {
      name: string;
      value: string;
    }[];
  }[];
  cooldown?: number;
  voiceChannel?: boolean;
  canUseInDm?: boolean;
  botPermissions?: bigint[];
  permissionsRequired?: bigint[];
}

export interface ContextInterface {
  execute: (
    interaction: MessageContextMenuCommandInteraction &
      UserContextMenuCommandInteraction,
    client: Client
  ) => void;
  name: string;
  shortName: string;
  type: ApplicationCommandType;
  contexts?: string[];
  deleted: boolean;
  cooldown?: number;
  canUseInDm?: boolean;
  botPermissions?: bigint[];
  permissionsRequired?: bigint[];
}

export interface ButtonInterface {
  execute: (interaction: ButtonInteraction, client: Client) => void;
  disabled: boolean;
  cooldown?: number;
  voiceChannel?: boolean;
  botPermissions?: bigint[];
  permissionsRequired?: bigint[];
}

export interface SelectMenuInterface {
  execute: (interaction: StringSelectMenuInteraction, client: Client) => void;
  disabled: boolean;
  cooldown?: number;
  voiceChannel?: boolean;
  botPermissions?: bigint[];
  permissionsRequired?: bigint[];
}