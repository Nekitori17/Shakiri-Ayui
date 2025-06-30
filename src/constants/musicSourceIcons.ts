/**
 * Icons for different music sources.
 */

import { TrackSource } from "discord-player";

export const musicSourceIcons: { [key in TrackSource]: string } = {
  youtube: "https://img.icons8.com/color/512/youtube-play.png",
  spotify: "https://img.icons8.com/color/512/spotify.png",
  soundcloud: "https://img.icons8.com/color/512/soundcloud.png",
  apple_music: "https://img.icons8.com/color/512/apple-music.png",
  arbitrary: "https://img.icons8.com/color/512/file.png"
}