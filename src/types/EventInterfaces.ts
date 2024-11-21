import { Client } from "discord.js";
import { Player } from "discord-player";

export type DiscordEventInterface = (client: Client, args?: any) => void;
export type MusicEventInterface = (player: Player, client?: Client) => void;