import { useTimeline } from "discord-player";
import { handleInteractionError } from "../../../helpers/utils/handleError";
import { ButtonInterface } from "./../../../types/InteractionInterfaces";
import { CustomError } from "../../../helpers/utils/CustomError";

const button: ButtonInterface = {
  async execute(interaction, client) {
    try {
      const trackTimeline = useTimeline({
        node: interaction.guildId!,
      });

      if (!trackTimeline)
        throw new CustomError({
          name: "NoQueue",
          message: "There is no queue to forward",
        });

      const newPositionSeek = trackTimeline.timestamp.current.value - 10_000;

      if (newPositionSeek < 0) {
        await trackTimeline.setPosition(0);
        await interaction.deferUpdate();

        return true
      }
        
      
      await trackTimeline.setPosition(newPositionSeek);

      await interaction.deferUpdate();

      return true;
    } catch (error) {
      handleInteractionError(interaction, error, true);

      return false;
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default button;
