import path from "path";
import jsonStore from "json-store-typed";

/**
 * *  Checks if the user is the owner of the temporary voice channel.
 * @param voiceId The ID of the voice channel.
 * @param userId The ID of the user.
 * @returns True if the user is the owner, false otherwise.
 */
export default (voiceId: string, userId: string): boolean => {
  const temporaryVoiceList = jsonStore(
    path.join(__dirname, "../../../../database/temporaryVoiceChannels.json"),
  );
  const ownerId = temporaryVoiceList.get(voiceId);

  return userId === ownerId;
};
