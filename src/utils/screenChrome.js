export const BRANDED_STATUS_BAR_SCREENS = new Set([
  "client-home",
  "coach-profile",
]);

export function usesBrandedStatusBar(screen) {
  return BRANDED_STATUS_BAR_SCREENS.has(screen);
}
