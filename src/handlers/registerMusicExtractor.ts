import { Player } from "discord-player";
import {
  DefaultExtractors,
  SoundCloudExtractor,
} from "@discord-player/extractor";
import { YoutubeiExtractor } from "discord-player-youtubei";
import { SoundcloudExtractor as ExSoundcloudExtractor } from "discord-player-soundcloud";
import { TTSExtractor } from "discord-player-tts";
import { errorLogger } from "../helpers/errors/handleError";
import isCanUseYoutube from "../helpers/discord/validators/canUseYoutube";

export default async (player: Player) => {
  try {
    console.log("✨ | Starting load music extractors...");

    // Load default extractors
    await player.extractors.loadMulti(DefaultExtractors);

    // Unregister the default SoundcloudExtractor to override it
    await player.extractors.unregister(SoundCloudExtractor.identifier);

    // Override default extractors
    await player.extractors.register(ExSoundcloudExtractor, {});

    // Register other extractors
    await player.extractors.register(TTSExtractor, {
      language: "vi",
      slow: false,
    });

    console.log("⌛ | Checking if youtube is available...");

    // Check if YouTube is available
    // if (await isCanUseYoutube()) {
    if (true) {
      console.log("🔰 | Youtube is available. Being loaded...");
      await player.extractors.register(YoutubeiExtractor, {
        streamOptions: {
          highWaterMark: 1 << 25,
          useClient: "TV",
        },
        logLevel: "LOW",
      });
    } else {
      console.log("❌ | Youtube is not available. Skipping loading...");
    }

    console.log("✅ | Music extractors loaded successfully!");
  } catch (error) {
    errorLogger(error);
  }
};
