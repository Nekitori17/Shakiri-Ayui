import { prop } from "@typegoose/typegoose";

export class Moderator {
  @prop({ default: false })
  logging!: boolean;

  @prop()
  loggingChannel?: string;
}