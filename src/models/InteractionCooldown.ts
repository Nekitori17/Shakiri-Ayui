import { InferSchemaType, Schema, model } from "mongoose";

const interactionCooldown = new Schema({
  userId: { type: String, required: true },
  commandName: { type: String, required: true },
  expireAt: { type: Date, required: true, expires: 0 },
});

type InteractionCooldownType = InferSchemaType<typeof interactionCooldown>;
export default model<InteractionCooldownType>("interactionCooldown", interactionCooldown);;
