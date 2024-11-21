import { ButtonStyle } from "discord.js"

export interface ButtonComponentInterface {
  label: string,
  customId?: string,
  style?: ButtonStyle,
  emoji?: string | number,
  url?: string,
  disabled?: boolean
}