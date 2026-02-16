import { Innertube, Platform, Types } from "youtubei.js";

/**
 * Configure youtubei.js with proper evaluator for signature deciphering.
 */
export function configureYouTubeJS(): void {
  if ((Platform.shim as any).__installed) return;

  Platform.shim.eval = async (
    data: Types.BuildScriptResult,
    env: Record<string, Types.VMPrimative>,
  ) => {
    const properties = [];

    // Properly escape strings to prevent breaking the code
    const escapeForJS = (str: any): string => {
      return String(str)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t");
    };

    if (env.n) {
      properties.push(`n: exportedVars.nFunction("${escapeForJS(env.n)}")`);
    }

    if (env.sig) {
      properties.push(
        `sig: exportedVars.sigFunction("${escapeForJS(env.sig)}")`,
      );
    }

    const code = `${data.output}\nreturn { ${properties.join(", ")} }`;

    return new Function(code)();
  };

  (Platform.shim as any).__installed = true;
}

/**
 * Checks if the YouTube API can be used by attempting to download.
 * @returns Promise<boolean> - true if YouTube API is available, false otherwise
 */
export default async function canUseYoutube(): Promise<boolean> {
  try {
    configureYouTubeJS();

    const youtube = await Innertube.create();

    // Get video info
    const info = await youtube.getInfo("dQw4w9WgXcQ");

    // Try to get a downloadable format
    const format = info.chooseFormat({
      type: "audio",
      quality: "best",
    });

    if (!format) {
      console.error("No format available");
      return false;
    }

    // Try to create download stream - this is the real test
    await info.download({
      type: "audio",
      quality: "best",
    });

    // If we can create stream, YouTube works
    return true;
  } catch (err) {
    console.error("YouTube availability check failed:", err);
    return false;
  }
}
