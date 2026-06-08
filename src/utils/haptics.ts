import * as Haptics from "expo-haptics";

/**
 * Thin wrapper over expo-haptics. Calls are fire-and-forget and swallow errors
 * so a platform without haptics (web, some Android devices) is a silent no-op.
 */
const run = (fn: () => Promise<void>) => {
  fn().catch(() => {});
};

export const haptics = {
  /** Light tap — lightweight confirmations. */
  light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Medium tap — a more pronounced action. */
  medium: () =>
    run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  /** Selection tick — navigating / picking an item. */
  selection: () => run(() => Haptics.selectionAsync()),
  /** Success buzz — e.g. saving a bookmark. */
  success: () =>
    run(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    ),
  /** Warning buzz — e.g. an empty/invalid action. */
  warning: () =>
    run(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
    ),
};
