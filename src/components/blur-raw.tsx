"use client";
import React from "react";
import { StyleSheet } from "react-native";

import { BlurView, type BlurViewProps } from "expo-blur";

export function BlurViewRawBackdrop({
  tint = "default",
  intensity = 50,
  blurReductionFactor = 4,
  experimentalBlurMethod = "none",
  style,
  children,
  ...props
}: BlurViewProps) {
  return (
    <BlurView
      tint={tint}
      intensity={intensity}
      blurReductionFactor={blurReductionFactor}
      experimentalBlurMethod={experimentalBlurMethod}
      style={[StyleSheet.absoluteFill, { overflow: "hidden" }]}
      {...props}
    >
      {children}
    </BlurView>
  );
}
