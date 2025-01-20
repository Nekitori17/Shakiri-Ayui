import axios from "axios";
import sharp from "sharp";
import { AttachmentBuilder } from "discord.js";

export default async ({
  url,
  buffer,
  format,
}: {
  url?: string;
  buffer?: Buffer;
  format: keyof sharp.FormatEnum | sharp.AvailableFormatInfo;
}): Promise<AttachmentBuilder | undefined> => {
  try {
    let fileContent: Buffer;

    if (url) {
      const fileResponse = await axios
        .get(url, {
          responseType: "arraybuffer",
        })
        .then((res) => res.data);
      fileContent = Buffer.from(fileResponse);
    } else if (buffer) {
      fileContent = Buffer.from(buffer);
    } else {
      throw new Error("No url or buffer provided");
    }

    const fileConverted = await sharp(fileContent).toFormat(format).toBuffer();
    const fileName: string = `${Date.now()}_${(
      process.hrtime.bigint() / 1000000n
    ).toString()}.${format}`;

    return new AttachmentBuilder(fileConverted, {
      name: fileName,
    });
  } catch (error) {
    console.error(`Error processing file: ${error}`);
  }
};
