/**
 * SweatNScroll Notification Service
 * Manages permission requests and scroll timer notifications via the service worker.
 */

/**
 * Request notification permission.
 * Returns true if granted.
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const result = await Notification.requestPermission();
  return result === 'granted';
}

/**
 * Schedule a notification via the service worker when scroll time expires.
 * Uses `registration.active` — `navigator.serviceWorker.controller` is often null
 * on first load, which previously meant the timer never got scheduled on phones.
 * @param {number} endTime - Unix ms timestamp when scrolling ends
 */
export async function scheduleScrollEndNotification(endTime) {
  if (!('serviceWorker' in navigator)) return;

  const permitted = await requestNotificationPermission();
  if (!permitted) return;

  try {
    const reg = await navigator.serviceWorker.ready;
    if (reg.active) {
      reg.active.postMessage({ type: 'SCHEDULE_SCROLL_NOTIFICATION', endTime });
    }
  } catch {
    /* ignore */
  }
}

/**
 * Cancel the scroll end notification (e.g., session ended in-app).
 */
export function cancelScrollEndNotification() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready
    .then((reg) => {
      if (reg.active) {
        reg.active.postMessage({ type: 'CANCEL_SCROLL_NOTIFICATION' });
      }
    })
    .catch(() => {});
}

/** Buzz when scroll time ends (foreground / tab visible). No-op if unsupported. */
export function vibrateScrollTimeUp() {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    navigator.vibrate([200, 100, 200, 100, 400]);
  } catch {
    /* ignore */
  }
}

/**
 * When the tab is visible, some phones handle this better than window.alert().
 * Uses the same tag as the SW notification so duplicates replace instead of stack.
 */
export function showScrollTimeUpPageNotification() {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  if (typeof document !== 'undefined' && document.hidden) return;
  try {
    new Notification("Time's up! ⏰", {
      body: 'Your scroll session ended. Open SweatNScroll to earn more.',
      tag: 'scroll-timer',
      requireInteraction: true,
    });
  } catch {
    /* ignore */
  }
}
