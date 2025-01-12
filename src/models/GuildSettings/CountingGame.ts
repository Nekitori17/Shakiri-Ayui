import { prop } from "@typegoose/typegoose";

export class CountingGame {
  @prop({ default: false })
  enabled!: boolean;

  @prop({ default: 1 })
  startNumber!: number;

  @prop()
  channelSet?: string;
}