// Session guard: count-up animations play only during the initial website
// launch window. Counters mounted later (route changes, late scroll into view)
// render their final value immediately, so the animation happens exactly once
// per website launch.

const LAUNCH_WINDOW_MS = 2500;
let launchEpoch = 0;

export function isLaunchWindow() {
  if (!launchEpoch) launchEpoch = Date.now();
  return Date.now() - launchEpoch < LAUNCH_WINDOW_MS;
}
