import fs from "fs";
import path from "path";
import { promisify } from "util";
import { pipeline } from "stream";
import { Innertube } from "youtubei.js";

/**
 * * Checks if the YouTube API can be used.
 * @returns True if the YouTube API can be used, false otherwise.
 */
export default async () => {
  try {
    // Create an Innertube instance to interact with the YouTube API
    const youtube = await Innertube.create();
    // Attempt to download a short video to check API functionality
    const stream = await youtube.download("V3ckbAOCVxI");

    // Define a temporary file path for the downloaded stream
    const filePath = path.resolve("./tmp.mp4");
    // Create a write stream to save the downloaded content
    const fileStream = fs.createWriteStream(filePath);
    // Promisify the stream pipeline for async/await usage
    const pipelineAsync = promisify(pipeline);
    await pipelineAsync(stream, fileStream);
    // Delete the temporary file after successful download
    fs.unlinkSync(filePath);

    return true;
  } catch (err) {
    // If an error occurs, delete the temporary file if it exists
    if (fs.existsSync(path.resolve("./tmp.mp4")))
      fs.unlinkSync(path.resolve("./tmp.mp4"));
    return false;
  }
};
