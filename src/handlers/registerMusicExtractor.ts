import { Player } from "discord-player";
import isCanUseYoutube from "../validator/isCanUseYoutube";
import { YoutubeiExtractor } from "discord-player-youtubei";
import { DefaultExtractors } from "@discord-player/extractor";

export default async (player: Player) => {
  console.log("✨ | Starting load music extractors...");
  
  // Load default extractors
  await player.extractors.loadMulti(DefaultExtractors);

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
};
