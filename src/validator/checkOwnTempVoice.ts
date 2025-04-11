import path from "path";
import jsonStore from "json-store-typed";

export default (voiceId: string, userId: string) => {
  const tempVoiceList = jsonStore(
    path.join(__dirname, "../../database/temporaryVoiceChannels.json")
  );
  const ownerId = tempVoiceList.get(voiceId);

  return userId == ownerId;
};
