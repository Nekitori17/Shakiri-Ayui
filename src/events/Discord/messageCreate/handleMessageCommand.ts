// import {
//   APIAuthorizingIntegrationOwnersMap,
//   APIInteractionGuildMember,
//   ApplicationCommand,
//   Attachment,
//   CacheType,
//   ChannelType,
//   ChatInputCommandInteraction,
//   Client,
//   Collection,
//   CommandInteractionOptionResolver,
//   CommandInteractionResolvedData,
//   Entitlement,
//   Guild,
//   GuildMember,
//   GuildPremiumTier,
//   GuildResolvable,
//   InteractionContextType,
//   InteractionType,
//   InteractionWebhook,
//   Locale,
//   Message,
//   PermissionFlagsBits,
//   PermissionsBitField,
//   Snowflake,
//   TextBasedChannel,
//   User,
// } from "discord.js";
// import config from "../../../config";
// import { getCommandObject } from "../../../preloaded";
import { DiscordEventInterface } from "../../../types/EventInterfaces";
// import { CommandInterface } from "../../../types/InteractionInterfaces";
// import { CommandOptionInterface } from "./../../../types/InteractionInterfaces";

// const event: DiscordEventInterface = async (client, message: Message) => {
//   // Ignore bot messages
//   if (message.author.bot) return;

//   const messageCommandPrefix = message.guildId
//     ? client.getGuildSetting(message.guildId)
//     : client.config.defaultPrefix;

//   // Is command with prefix
//   const messageContentTrimmed = message.content.trim();
//   if (!new RegExp(`^${config.prefix}`, "i").test(messageContentTrimmed)) return;

//   // Parser message
//   const [commandName, ...args] = messageContentTrimmed
//     .slice(config.prefix.length)
//     .trim()
//     .split(/\s+/);

//   // Get command object
//   const commandObject = getCommandObject(commandName);

//   if (!commandObject) return;

//   const interaction = await nativeMessageCommandToChatInputCommandInteraction(
//     message,
//     commandObject,
//     args,
//   );
// };

// export default event;

// async function nativeMessageCommandToChatInputCommandInteraction(
//   message: Message,
//   command: CommandInterface,
//   args: string[] = [],
// ) {
//   const applicationCommand = (
//     await message.client.application?.commands.fetch()
//   ).find((cmd) => cmd.name == command.name)!;

//   const memberPermissions = await getMemberPermission(message);

//   class ChatMessageCommandInteraction implements ChatInputCommandInteraction {
//     public applicationId: string =
//       message.applicationId || String(message.client.application.id);

//     public appPermissions: Readonly<PermissionsBitField> =
//       getAppPermission(message);

//     public attachmentSizeLimit: number = getMaxAttachmentSize(message);

//     public authorizingIntegrationOwners: APIAuthorizingIntegrationOwnersMap =
//       message.guild
//         ? {
//             "0": message.guild.id,
//           }
//         : {
//             "0": "0",
//           };

//     public get channel(): TextBasedChannel | null {
//       return message.channel;
//     }

//     public channelId: string = message.channelId;

//     public client: Client<true> = message.client;

//     public get command():
//       | ApplicationCommand<{}>
//       | ApplicationCommand<{ guild: GuildResolvable }>
//       | null {
//       return applicationCommand;
//     }

//     public commandGuildId: string | null = applicationCommand.guildId;

//     public commandId: string = applicationCommand.id;

//     public commandName: string = command.name;

//     public commandType: number = applicationCommand.type;

//     public context: InteractionContextType = message.guild
//       ? InteractionContextType.Guild
//       : message.channel.type == ChannelType.GroupDM
//         ? InteractionContextType.PrivateChannel
//         : InteractionContextType.BotDM;

//     public get createdAt(): Date {
//       return message.createdAt;
//     }

//     public get createdTimestamp(): number {
//       return message.createdTimestamp;
//     }

//     public deferred: boolean = false;

//     public entitlements: Collection<string, Entitlement> = new Collection<
//       string,
//       Entitlement
//     >();

//     public ephemeral: boolean | null = false;

//     public get guild(): Guild | null {
//       return message.guild;
//     }

//     public guildId: string | null = message.guildId;

//     public guildLocale: Locale | null = message.guild ? Locale.EnglishUS : null;

//     public id: string = message.id;

//     public locale: Locale = Locale.EnglishUS;

//     public member: GuildMember | APIInteractionGuildMember | null =
//       message.member;

//     public memberPermissions: Readonly<PermissionsBitField> | null =
//       memberPermissions;

//     // public options: Omit<
//     //   CommandInteractionOptionResolver<CacheType>,
//     //   "getMessage" | "getFocused"
//     // > = [];

//     public replied: boolean = false;

//     public token: string = generateFakeInteractionToken();

//     public type: InteractionType.ApplicationCommand =
//       InteractionType.ApplicationCommand;

//     public user: User = message.author;

//     public version: number = 1;

//     public webhook: InteractionWebhook = new InteractionWebhook(
//       message.client,
//       message.webhookId!,
//       "Fake",
//     ); // Need fix

//     private repliedMessage: Message | null = null;
//   }

//   return new ChatMessageCommandInteraction();
// }

// class MessageCommandError {
//   public name: string;
//   public message: string;

//   constructor(message: string) {
//     this.name = "MessageCommandError";
//     this.message = message;
//   }
// }

// class NotAvailableError {
//   public name: string;
//   public message: string;

//   constructor(message: string) {
//     this.name = "NotAvailableError";
//     this.message = message;
//   }
// }

// function getMaxAttachmentSize(message: Message) {
//   if (message.channel.isDMBased()) {
//     return 10 * 1024 * 1024;
//   }

//   if (message.guild) {
//     switch (message.guild.premiumTier) {
//       case GuildPremiumTier.None:
//         return 10 * 1024 * 1024;
//       case GuildPremiumTier.Tier1:
//         return 10 * 1024 * 1024;
//       case GuildPremiumTier.Tier2:
//         return 50 * 1024 * 1024;
//       case GuildPremiumTier.Tier3:
//         return 100 * 1024 * 1024;
//       default:
//         return 10 * 1024 * 1024;
//     }
//   }

//   return 10 * 1024 * 1024;
// }

// function getAppPermission(message: Message) {
//   if (message.channel.isDMBased()) {
//     return new PermissionsBitField(
//       PermissionFlagsBits.EmbedLinks |
//         PermissionFlagsBits.AttachFiles |
//         PermissionFlagsBits.MentionEveryone |
//         PermissionFlagsBits.UseExternalEmojis |
//         PermissionFlagsBits.SendPolls,
//     ).freeze();
//   }

//   const botMember = message.guild?.members.me;
//   if (!botMember || !message.channel.isTextBased()) {
//     return new PermissionsBitField(0n).freeze();
//   }

//   const perms = message.channel.permissionsFor(botMember);
//   return new PermissionsBitField(
//     PermissionsBitField.resolve(perms?.bitfield ?? 0n),
//   ).freeze();
// }

// async function getMemberPermission(message: Message) {
//   if (message.channel.isDMBased()) return null;

//   if (!message.channel.isTextBased()) return null;

//   const perms = message.channel.permissionsFor(message.author.id);
//   return new PermissionsBitField(
//     PermissionsBitField.resolve(perms?.bitfield ?? 0n),
//   ).freeze();
// }

// function generateFakeInteractionToken() {
//   const base64 = () =>
//     Buffer.from(Math.random().toString(36).substring(2)).toString("base64url");
//   return `${base64()}.${base64()}.${base64()}`;
// }

// function parserArguments(
//   message: Message,
//   commandOption: CommandOptionInterface[],
//   args: string[] | null,
//   attachments: Collection<Snowflake, Attachment> | null,
// ) {
//   if (commandOption.length !== args.length + (attachments?.size || 0))
//     throw new MessageCommandError(
//       `The number of arguments is not equal to the number of command options. Expected ${
//         commandOption.length
//       } but got ${args.length + (attachments?.size || 0)}.`,
//     );

//   let resolvedOption: CommandInteractionResolvedData<CacheType>;

//   class MessageCommandInteractionOptionResolver implements Omit<
//     CommandInteractionOptionResolver<CacheType>,
//     "getMessage" | "getFocused"
//   > {
//     public client: Client<true> = message.client;

//     public resolved: Readonly<
//       CommandInteractionResolvedData<CacheType>
//     > | null = {
//       attachments: new Collection<string, Attachment>({}),
//     };
//   }
// }

const event: DiscordEventInterface = (client, args) => {};

export default event;
