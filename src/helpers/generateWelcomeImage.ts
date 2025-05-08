import fs from "fs";
import path from "path";
import axios from "axios";
import { Vibrant } from "node-vibrant/node";
import { Client, Guild, GuildMember, User } from "discord.js";
import mediaConverter from "./mediaConverter";
import { genericVariableReplacer } from "./variableReplacer";

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
  const welcomeImageTemplateContent = fs.readFileSync(
    path.join(__dirname, "../../assets/templates/welcome-image.svg"),
    "utf-8"
  );

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
  const colorPaletteOfAvatar = await Vibrant.from(
    userAvatarBuffer
  ).getPalette();
  const primaryColor = colorPaletteOfAvatar.Vibrant?.hex;
  const secondaryColor = colorPaletteOfAvatar.Muted?.hex;

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

  const variableInSvgFile: { [key: string]: string } = {
    avatar_base64: userAvatarBuffer.toString("base64"),
    avatar_frame_color: primaryColor ?? "#1a1a1a",
    title: replacedTitle,
    body: replacedBody,
    body_color: secondaryColor ?? "#ffffff",
    footer: replacedFooter,
  };

  let replacedSvgContent = welcomeImageTemplateContent;
  for (const key in variableInSvgFile) {
    const regex = new RegExp(`{{ ${key} }}`, "g");
    replacedSvgContent = replacedSvgContent.replace(
      regex,
      variableInSvgFile[key]
    );
  }

  const pngImage = await mediaConverter({
    buffer: Buffer.from(replacedSvgContent.trim()),
    format: "png",
  });

  return pngImage;
};
