import config from "../config";
import { Client, ClientOptions } from "discord.js";
import { FnUtils } from "../helpers/common/FnUtils";
import { CustomError } from "../helpers/errors/CustomError";
import { handleInteractionError } from "../helpers/errors/handleError";
import CommonEmbedBuilder from "../helpers/discord/embeds/commonEmbedBuilder";
import { genericVariableFormatter } from "../helpers/formatters/variableFormatter";
import GuildSettings from "../models/GuildSettings";

class ExtendedClient extends Client {
  public config = config;

  public constants = {
    CONTROL_PANEL_TAG: "\u200B",
  };

  public FnUtils = FnUtils;

  public utils = {
    genericVariableFormatter,
  };
  
  public CustomError = CustomError;

  public CommonEmbedBuilder = CommonEmbedBuilder;

  public constructor(options: ClientOptions) {
    super(options);
  }

  public getGuildSetting = async (guildId: string) =>
    GuildSettings.findOneAndUpdate(
      { guildId },
      { $setOnInsert: { guildId } },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      }
    );

  public interactionErrorHandler = handleInteractionError;
}

export default ExtendedClient;
export type { ExtendedClient };