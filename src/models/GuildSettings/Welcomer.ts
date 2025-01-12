import { prop } from "@typegoose/typegoose";

export class Welcomer {
  @prop({ default: false })
  enabled!: boolean;

  @prop({ default: "> Welcome {user} to __{guild}__." })
  message!: string;

  @prop()
  channelSend?: string;

  @prop({ default: "https://i.ibb.co/BnCqSH0/banner.jpg" })
  backgroundImage!: string;

  @prop({ default: "{user_display}" })
  imageTitle!: string;

  @prop({ default: "Welcome to {guild}" })
  imageBody!: string;

  @prop({ default: "Member #{member_count}" })
  imageFooter!: string;
}