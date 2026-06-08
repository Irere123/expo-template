import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Pause, Volume2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/icon";

/**
 * A pill that plays a single audio pronunciation. Manages its own playback
 * state (play / pause / reset-on-finish) and surfaces load/playback failures
 * inline instead of crashing.
 *
 * The parent only renders this when a pronunciation URL exists, so there is no
 * "no audio" state to handle here.
 */
export function AudioButton({ url, label }: { url: string; label: string }) {
  const player = useAudioPlayer({ uri: url });
  const status = useAudioPlayerStatus(player);
  const [failed, setFailed] = useState(false);

  const isPlaying = status.playing;

  // Reset back to the start once playback finishes so it can be replayed.
  useEffect(() => {
    if (status.didJustFinish) {
      player.seekTo(0);
      player.pause();
    }
  }, [status.didJustFinish, player]);

  const onPress = () => {
    try {
      if (isPlaying) {
        player.pause();
        return;
      }
      player.seekTo(0);
      player.play();
    } catch {
      setFailed(true);
    }
  };

  if (failed) {
    return (
      <View className="flex-row items-center gap-1.5 rounded-full bg-muted px-3.5 py-1.5 opacity-60 border-continuous">
        <Icon icon={Volume2} className="w-4 h-4 text-muted-foreground" />
        <Text className="text-sm text-muted-foreground">
          {label} unavailable
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Play ${label} pronunciation`}
      className="flex-row items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 active:opacity-60 border-continuous"
    >
      <Icon
        icon={isPlaying ? Pause : Volume2}
        className="w-4 h-4 text-foreground"
      />
      <Text className="text-sm font-medium text-foreground">{label}</Text>
    </Pressable>
  );
}
