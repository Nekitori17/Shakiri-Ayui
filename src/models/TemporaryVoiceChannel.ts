import { InferSchemaType, Schema, model } from "mongoose";

const temporaryVoiceChannel = new Schema({
  channelId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
});

type TemporaryVoiceChannelType = InferSchemaType<typeof temporaryVoiceChannel>;
export default model<TemporaryVoiceChannelType>("temporaryVoiceChannel", temporaryVoiceChannel);
