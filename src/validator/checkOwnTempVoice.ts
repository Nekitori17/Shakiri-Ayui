import path from "path";
import jsonStore from "json-store-typed";

/**
 * *  Checks if the user is the owner of the temporary voice channel.
 * @param voiceId The ID of the voice channel.
 * @param userId The ID of the user.
 * @returns True if the user is the owner, false otherwise.
 */
export default (voiceId: string, userId: string) => {
  // Initialize a JSON store to manage temporary voice channel data
  const temporaryVoiceList = jsonStore(
    path.join(__dirname, "../../database/temporaryVoiceChannels.json")
  );
  // Retrieve the owner ID associated with the given voice channel ID
  const ownerId = temporaryVoiceList.get(voiceId);

  // Compare the provided user ID with the retrieved owner ID
  return userId == ownerId;
};
