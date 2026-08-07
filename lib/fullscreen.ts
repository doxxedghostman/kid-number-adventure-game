/**
 * Thin wrapper around the Fullscreen API. Kept as a helper (rather than
 * inlined at each call site) because vendor-prefixed fallbacks are needed
 * for older WebViews, and because every call must be wrapped defensively —
 * iOS Safari on iPhone doesn't support element.requestFullscreen() at all,
 * and some Android WebViews reject the call if it isn't triggered directly
 * inside a user gesture. In both cases we just no-op instead of throwing,
 * since the game is fully playable (just not edge-to-edge) without it.
 */

type FullscreenDoc = Document & {
  webkitFullscreenElement?: Element;
  webkitExitFullscreen?: () => Promise<void> | void;
};

type FullscreenEl = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

export function enterFullscreen(el?: HTMLElement) {
  if (typeof document === 'undefined') return;
  const target = (el ?? document.documentElement) as FullscreenEl;
  const request = target.requestFullscreen ?? target.webkitRequestFullscreen;
  if (!request) return; // Fullscreen API not supported (e.g. iPhone Safari) — silently skip.
  try {
    const result = request.call(target);
    if (result && typeof (result as Promise<void>).catch === 'function') {
      (result as Promise<void>).catch(() => {
        // Most commonly: call wasn't inside a user-gesture handler. Ignore.
      });
    }
  } catch {
    // Ignore — never let a fullscreen failure block navigation or gameplay.
  }
}

export function exitFullscreen() {
  if (typeof document === 'undefined') return;
  const doc = document as FullscreenDoc;
  if (!doc.fullscreenElement && !doc.webkitFullscreenElement) return;
  const exit = doc.exitFullscreen ?? doc.webkitExitFullscreen;
  if (!exit) return;
  try {
    const result = exit.call(doc);
    if (result && typeof (result as Promise<void>).catch === 'function') {
      (result as Promise<void>).catch(() => {});
    }
  } catch {
    // Ignore.
  }
}
