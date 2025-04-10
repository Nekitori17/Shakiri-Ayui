import { Player } from "discord-player";
import isCanUseYoutube from "../helpers/isCanUseYoutube";
import { YoutubeiExtractor } from "discord-player-youtubei";
import { DefaultExtractors } from "@discord-player/extractor";

export default (player: Player) => {
  console.log("✨ | Starting load music extractors...");

  (async () => {
    await player.extractors.loadMulti(DefaultExtractors);
  })();

  console.log("⌛ | Checking if youtube is available...");
  (async () => {
    if (await isCanUseYoutube()) {
      console.log("🔰 | Youtube is available. Being loaded...");
      await player.extractors.register(YoutubeiExtractor, {
        streamOptions: {
          highWaterMark: 1 << 25,
          useClient: "TV",
        },
      });
    } else {
      console.log("❌ | Youtube is not available. Skipping loading...)");
    }
  })();

  console.log("✅ | Music extractors loaded successfully!");
};
