import sharp from "sharp";
import { AttachmentBuilder } from "discord.js";

type ConverterOptions =
  | {
      url: string;
      buffer?: Buffer;
      format: keyof sharp.FormatEnum | sharp.AvailableFormatInfo;
    }
  | {
      url?: string;
      buffer: Buffer;
      format: keyof sharp.FormatEnum | sharp.AvailableFormatInfo;
    };

/**
 * Converts an image (from URL or Buffer) to a specified format
 * and returns it as a Discord AttachmentBuilder instance.
 *
 * @param url - Optional URL of the image to convert.
 * @param buffer - Optional Buffer containing image data.
 * @param format - Output image format (e.g., png, jpeg, webp).
 * @returns An AttachmentBuilder with the converted image, or undefined if error occurs.
 */
export default async ({ url, buffer, format }: ConverterOptions) => {
  let fileInputBuffer: Buffer;

  if (url) {
    const fileResponseArrayBuffer = await fetch(url).then((res) => {
      if (!res.ok) {
        throw new Error(
          `Failed to fetch image from URL: ${res.status} ${res.statusText}`,
        );
      }
      return res.arrayBuffer();
    });

    fileInputBuffer = Buffer.from(fileResponseArrayBuffer);
  } else if (buffer) {
    fileInputBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  } else {
    throw new Error("No url or buffer provided");
  }

  const fileConvertedBuffer = await sharp(fileInputBuffer)
    .toFormat(format)
    .toBuffer();

  return {
    buffer: fileConvertedBuffer,
    toDiscordAttachment: () =>
      new AttachmentBuilder(fileConvertedBuffer, { name: `image.${format}` }),
  };
};
