import { MinusSignIcon } from "@hugeicons/core-free-icons";
import { View } from "react-native";

import { Icon } from "@/components/icon";

export function AndroidGrabber() {
  return (
    <View className="items-center pt-2 pb-1">
      <Icon
        icon={MinusSignIcon}
        strokeWidth={4}
        className="w-8 h-8 text-muted-foreground"
      />
    </View>
  );
}
