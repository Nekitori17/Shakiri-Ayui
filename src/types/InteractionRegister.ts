import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";

export interface CommandRegisterInterface {
  name: string;
  description: string;
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
}

export interface ContextRegisterInterface {
  name: string;
  type: ApplicationCommandType;
  contexts?: string[] | null;
}

export type InteractionRegisterInteraface = CommandRegisterInterface | ContextRegisterInterface