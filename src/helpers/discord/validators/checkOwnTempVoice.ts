import TemporaryVoiceChannel from "../../../models/TemporaryVoiceChannel";

/**
 * *  Checks if the user is the owner of the temporary voice channel.
 * @param voiceId The ID of the voice channel.
 * @param userId The ID of the user.
 * @returns True if the user is the owner, false otherwise.
 */
export default async (voiceId: string, userId: string): Promise<boolean> => {
  const tempChannel = await TemporaryVoiceChannel.findOne({ channelId: voiceId });
  if (!tempChannel) return false;

  return userId === tempChannel.userId;
};
