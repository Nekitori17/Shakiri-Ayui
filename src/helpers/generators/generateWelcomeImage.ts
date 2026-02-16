import fs from "fs";
import path from "path";
import { Vibrant } from "node-vibrant/node";
import { Client, Guild, GuildMember, User } from "discord.js";
import mediaConverter from "../tools/mediaConverter";
import { genericVariableFormatter } from "../formatters/variableFormatter";

/**
 * Generates a welcome image using an SVG template, the user's avatar,
 * and color palette extracted from their avatar.
 *
 * @param payload - Text content to insert into the image (title, body, footer).
 * @param user - The user or guild member being welcomed.
 * @param guild - The guild where the welcome is happening.
 * @param client - The Discord client instance.
 * @returns A buffer containing the final PNG welcome image.
 */
export default async (
  payload: {
    title: string;
    body: string;
    footer: string;
  },
  user: User | GuildMember,
  guild: Guild,
  client: Client,
) => {
  const welcomeImageTemplateFileContent = fs.readFileSync(
    path.join(__dirname, "../../../assets/templates/welcome-image.svg"),
    "utf-8",
  );

  const userAvatarArrayBuffer = await fetch(
    user.displayAvatarURL({
      extension: "png",
      size: 256,
    }),
  ).then((res) => {
    if (!res.ok)
      throw new Error(`Failed to fetch user avatar: ${res.statusText}`);
    return res.arrayBuffer();
  });

  const userAvatarBuffer = Buffer.from(userAvatarArrayBuffer);

  const colorPaletteOfAvatar =
    await Vibrant.from(userAvatarBuffer).getPalette();
  const primaryColor = colorPaletteOfAvatar.Vibrant?.hex;
  const secondaryColor = colorPaletteOfAvatar.Muted?.hex;

  const formattedTitle = genericVariableFormatter(
    payload.title,
    user,
    guild,
    client,
  );
  const formattedBody = genericVariableFormatter(
    payload.body,
    user,
    guild,
    client,
  );
  const formattedFooter = genericVariableFormatter(
    payload.footer,
    user,
    guild,
    client,
  );

  const variableInSvgFile: { [key: string]: string } = {
    avatar_base64: userAvatarBuffer.toString("base64"),
    avatar_frame_color: primaryColor ?? "#1a1a1a",
    title: formattedTitle,
    body: formattedBody,
    body_color: secondaryColor ?? "#ffffff",
    footer: formattedFooter,
  };

  let replacedWelcomeImageTemplateFileContent = welcomeImageTemplateFileContent;
  for (const key in variableInSvgFile) {
    const regex = new RegExp(`{{ ${key} }}`, "g");
    replacedWelcomeImageTemplateFileContent =
      replacedWelcomeImageTemplateFileContent.replace(
        regex,
        variableInSvgFile[key],
      );
  }

  const welcomeImageBuffer = await mediaConverter({
    buffer: Buffer.from(replacedWelcomeImageTemplateFileContent.trim()),
    format: "png",
  });

  return welcomeImageBuffer.toDiscordAttachment();
};
