import { Player } from "discord-player";
import isCanUseYoutube from "../validator/isCanUseYoutube";
import { YoutubeiExtractor } from "discord-player-youtubei";
import {
  DefaultExtractors,
  SoundCloudExtractor,
} from "@discord-player/extractor";
import { SoundcloudExtractor as ExSoundcloudExtractor } from "discord-player-soundcloud";
import { TTSExtractor } from "discord-player-tts";
import { errorLogger } from "../helpers/utils/handleError";

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
    if (await isCanUseYoutube()) {
      console.log("🔰 | Youtube is available. Being loaded...");
      // Register YoutubeiExtractor if YouTube is available
      await player.extractors.register(YoutubeiExtractor, {
        streamOptions: {
          // Set highWaterMark for stream options
          highWaterMark: 1 << 25,
          // Set useClient for stream options
          useClient: "TV",
        },
      });
    } else {
      // Log if YouTube is not available
      console.log("❌ | Youtube is not available. Skipping loading...)");
    }

    console.log("✅ | Music extractors loaded successfully!");
  } catch (error) {
    errorLogger(error);
  }
};
