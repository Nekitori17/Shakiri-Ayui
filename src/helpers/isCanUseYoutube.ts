import fs from "fs";
import path from "path";
import { promisify } from "util";
import { pipeline } from "stream";
import { Innertube } from "youtubei.js";

export default async () => {
  try {
    const youtube = await Innertube.create();
    const stream = await youtube.download("MvsAesQ-4zA", {
      type: "video",
      format: "mp4",
      quality: "144p",
    });

    const filePath = path.resolve("./tmp.mp4");
    const fileStream = fs.createWriteStream(filePath);
    const pipelineAsync = promisify(pipeline);
    await pipelineAsync(stream, fileStream);
    fs.unlinkSync(filePath);

    return true;
  } catch (err) {
    return false;
  }
};
