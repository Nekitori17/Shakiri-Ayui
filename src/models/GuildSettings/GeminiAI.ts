import { prop } from "@typegoose/typegoose";

export class GeminiAI {
  @prop({ default: false })
  enabled!: boolean;

  @prop({ default: "!" })
  ignorePrefix!: string;

  @prop()
  channelSet?: string;
}