import fs from "fs";
import path from "path";
import axios from "axios";
import { Vibrant } from "node-vibrant/node";
import { Client, Guild, GuildMember, User } from "discord.js";
import mediaConverter from "./mediaConverter";
import { genericVariableReplacer } from "../utils/variableReplacer";

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
  client: Client
) => {
  // Load the SVG template as raw string
  const welcomeImageTemplateFileContent = fs.readFileSync(
    path.join(__dirname, "../../../assets/templates/welcome-image.svg"),
    "utf-8"
  );

  // Download user's avatar image as array buffer
  const userAvatarArrayBuffer = await axios
    .get(
      user.displayAvatarURL({
        extension: "png",
        size: 256,
      }),
      {
        responseType: "arraybuffer",
      }
    )
    .then((res) => res.data);

  const userAvatarBuffer = Buffer.from(userAvatarArrayBuffer);

  // Extract prominent colors from avatar using Vibrant
  const colorPaletteOfAvatar = await Vibrant.from(
    userAvatarBuffer
  ).getPalette();
  const primaryColor = colorPaletteOfAvatar.Vibrant?.hex;
  const secondaryColor = colorPaletteOfAvatar.Muted?.hex;

  // Replace variables in text with actual values (e.g., {{username}})
  const replacedTitle = genericVariableReplacer(
    payload.title,
    user,
    guild,
    client
  );
  const replacedBody = genericVariableReplacer(
    payload.body,
    user,
    guild,
    client
  );
  const replacedFooter = genericVariableReplacer(
    payload.footer,
    user,
    guild,
    client
  );

  // Prepare replacements for variables in SVG
  const variableInSvgFile: { [key: string]: string } = {
    avatar_base64: userAvatarBuffer.toString("base64"),
    avatar_frame_color: primaryColor ?? "#1a1a1a",
    title: replacedTitle,
    body: replacedBody,
    body_color: secondaryColor ?? "#ffffff",
    footer: replacedFooter,
  };

  // Inject all variables into the SVG content
  let replacedWelcomeImageTemplateFileContent = welcomeImageTemplateFileContent;
  for (const key in variableInSvgFile) {
    const regex = new RegExp(`{{ ${key} }}`, "g");
    replacedWelcomeImageTemplateFileContent =
      replacedWelcomeImageTemplateFileContent.replace(
        regex,
        variableInSvgFile[key]
      );
  }

  // Convert the final SVG string into a PNG image
  const welcomeImage = await mediaConverter({
    buffer: Buffer.from(replacedWelcomeImageTemplateFileContent.trim()),
    format: "png",
  });

  return welcomeImage;
};
