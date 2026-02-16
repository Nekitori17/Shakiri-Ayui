import { useTimeline } from "discord-player";
import { ButtonInterface } from "./../../../types/InteractionInterfaces";

const button: ButtonInterface = {
  async execute(interaction, client) {
    try {
      // Get the timeline for the current guild's music playback
      const trackTimeline = useTimeline({
        node: interaction.guildId!,
      });

      // If no timeline exists, throw a custom error
      if (!trackTimeline)
        throw new client.CustomError({
          name: "NoQueue",
          message: "There is no queue to forward",
        });

      // Calculate the new position to seek to (current position - 10 seconds)
      const newPositionSeek = trackTimeline.timestamp.current.value - 10_000;

      // If the new position is less than 0, set it to the beginning of the track
      if (newPositionSeek < 0) {
        await trackTimeline.setPosition(0);
        await interaction.deferUpdate();

        return true
      }
        
      
      // Set the track's position to the calculated new position
      await trackTimeline.setPosition(newPositionSeek);

      // Defer the interaction update to acknowledge the button click
      await interaction.deferUpdate();

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error, true);

      return false;
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default button;
