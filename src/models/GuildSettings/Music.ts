import { prop } from "@typegoose/typegoose";

export class Music {
  @prop({ default: 75 })
  volume!: number;

  @prop({ default: true })
  leaveOnEmpty!: boolean;

  @prop({ default: 60000 })
  leaveOnEmptyCooldown!: number;

  @prop({ default: true })
  leaveOnEnd!: boolean;

  @prop({ default: 60000 })
  leaveOnEndCooldown!: number;
}