import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
  Role,
} from "discord.js";
import sendError from "../../helpers/utils/sendError";
import { checkRolePosition } from "../../validator/checkRolePosition";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const targetUserOption = interaction.options.getUser("target")!;
    const roleOption = interaction.options.getRole("role")!;

    try {
      // Fetch the target user as a guild member
      const targetUser = await interaction.guild?.members.fetch(
        targetUserOption
      );

      // Check if the target user exists in the server
      if (!targetUser)
        throw {
          name: "UserNotFound",
          message: "That user does not exist in this server",
        };
      
      // Check role positions for hierarchy
      await checkRolePosition(
        interaction.member!,
        interaction.guild!.members.me!,
        roleOption,
        interaction.guild!
      )

      // Check if the target user already has the role
      if (targetUser.roles.cache.has(roleOption.id))
        throw {
          name: "RoleAlreadyAdded",
          message: "That user already has that role",
          type: "info",
        };
      
      // Add the role to the target user
      await targetUser.roles.add(roleOption as Role);

      // Send a confirmation message
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
              `Successfully Added the role ${roleOption} to ${targetUser}`
            )
            .setFooter({
              text: `Requested by ${interaction.user.tag}`,
            }),
        ],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "role-add",
  description: "Add a role to a user",
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
