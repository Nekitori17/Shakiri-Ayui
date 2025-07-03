import axios from "axios";
import sharp from "sharp";
import { AttachmentBuilder } from "discord.js";

/**
 * Converts an image (from URL or Buffer) to a specified format
 * and returns it as a Discord AttachmentBuilder instance.
 *
 * @param url - Optional URL of the image to convert.
 * @param buffer - Optional Buffer containing image data.
 * @param format - Output image format (e.g., png, jpeg, webp).
 * @returns An AttachmentBuilder with the converted image, or undefined if error occurs.
 */
export default async ({
  url,
  buffer,
  format,
}: {
  url?: string;
  buffer?: Buffer;
  format: keyof sharp.FormatEnum | sharp.AvailableFormatInfo;
}) => {
    let fileInputBuffer: Buffer;

    // Load file from URL if provided
    if (url) {
      const fileResponseArrayBuffer = await axios
        .get(url, {
          responseType: "arraybuffer",
        })
        .then((res) => res.data);

      fileInputBuffer = Buffer.from(fileResponseArrayBuffer);
    }
    // Or use directly provided buffer
    else if (buffer) {
      fileInputBuffer = Buffer.from(buffer);
    }
    // If neither is provided, throw error
    else {
      throw new Error("No url or buffer provided");
    }

    // Convert the image buffer to specified format
    const fileConverted = await sharp(fileInputBuffer)
      .toFormat(format)
      .toBuffer();

    // Generate unique file name based on timestamp + high-res time
    const fileName: string = `${Date.now()}_${(
      process.hrtime.bigint() / 1000000n
    ).toString()}.${format}`;

    // Return the image as a Discord attachment
    return new AttachmentBuilder(fileConverted, {
      name: fileName,
    });

};
