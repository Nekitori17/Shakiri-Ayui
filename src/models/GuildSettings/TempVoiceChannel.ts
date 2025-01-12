import { prop } from "@typegoose/typegoose";

export class TemporaryVoiceChannel {
  @prop({ default: false })
  enabled!: boolean;

  @prop({ default: "{username}'s Voice" })
  nameChannelSyntax!: string;

  @prop()
  channelSet?: string;

  @prop()
  categorySet?: string;
}