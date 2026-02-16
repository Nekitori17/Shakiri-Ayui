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

      await targetUser.roles.remove(roleOption as Role);

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: targetUser.user.displayName,
              iconURL: targetUser.displayAvatarURL(),
            })
            .setColor("Orange")
            .setTitle("🍥 Role removed")
            .setDescription(
              `Successfully removed the role ${roleOption} from ${targetUser}`,
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
  name: "role-remove",
  description: "Remove a role from a user",
  disabled: false,
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "target",
      description: "The user to remove the role from",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "role",
      description: "The role to remove from the user",
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
