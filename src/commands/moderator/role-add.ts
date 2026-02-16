import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
  Role,
} from "discord.js";
import { checkRolePosition } from "../../helpers/discord/validators/checkRolePosition";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const targetUserOption = interaction.options.getUser("target", true);
      const roleOption = interaction.options.getRole("role", true);

      const targetUser =
        await interaction.guild?.members.fetch(targetUserOption);

      if (!targetUser)
        throw new client.CustomError({
          name: "UserNotFound",
          message: "That user does not exist in this server",
        });

      await checkRolePosition(
        interaction.member!,
        interaction.guild!.members.me!,
        roleOption,
        interaction.guild!,
      );

      if (targetUser.roles.cache.has(roleOption.id))
        throw new client.CustomError({
          name: "RoleAlreadyAdded",
          message: "That user already has that role",
          type: "info",
        });

      await targetUser.roles.add(roleOption as Role);

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: targetUser.user.displayName,
              iconURL: targetUser.displayAvatarURL(),
            })
            .setColor("Green")
            .setTitle("🎭 Role Added")
            .setDescription(
              `Successfully Added the role ${roleOption} to ${targetUser}`,
            )
            .setFooter({
              text: `Requested by ${interaction.user.tag}`,
            }),
        ],
      });

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  name: "role-add",
  description: "Add a role to a user",
  disabled: false,
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "target",
      description: "The user to add the role to",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "role",
      description: "The role to add",
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ],
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.KickMembers],
  botPermissionsRequired: [PermissionFlagsBits.KickMembers],
};

export default command;
