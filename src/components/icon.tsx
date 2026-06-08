import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react-native";
import { StyleSheet } from "react-native";
import { withUniwind } from "uniwind";

function IconBase({
  icon,
  style,
  strokeWidth,
}: {
  icon: IconSvgElement;
  style?: any;
  strokeWidth?: number;
  className?: string;
}) {
  const flat = StyleSheet.flatten(style) || {};
  const size = (flat.width as number) ?? (flat.height as number) ?? 24;
  const color = (flat.color as string) ?? "currentColor";
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color={color}
      strokeWidth={strokeWidth ?? 1.8}
    />
  );
}

export const Icon = withUniwind(IconBase);
