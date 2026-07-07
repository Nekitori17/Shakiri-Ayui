import { Player } from "discord-player";
import {
  DefaultExtractors,
  SoundCloudExtractor,
} from "@discord-player/extractor";
import { YoutubeDlpExtractor } from "discord-player-youtubedlp";
import { SoundcloudExtractor as ExSoundcloudExtractor } from "discord-player-soundcloud";
import { TTSExtractor } from "discord-player-tts";
import { errorLogger } from "../helpers/errors/handleError";

export default async (player: Player) => {
  try {
    console.log("✨ | Starting load music extractors...");

    // Load default extractors
    await player.extractors.loadMulti(DefaultExtractors);

    // Unregister the default SoundcloudExtractor to override it
    await player.extractors.unregister(SoundCloudExtractor.identifier);

    // Override default extractors
    await player.extractors.register(ExSoundcloudExtractor, {});

    // Register youtube-dl extractor
    await player.extractors.register(YoutubeDlpExtractor, {});

    // Register other extractors
    await player.extractors.register(TTSExtractor, {
      language: "vi",
      slow: false,
    });

    console.log("⌛ | Checking if youtube is available...");

    console.log("✅ | Music extractors loaded successfully!");
  } catch (error) {
    errorLogger(error);
  }
};
