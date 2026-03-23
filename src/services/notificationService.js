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
 * Get the active service worker controller.
 */
function getSW() {
  return navigator?.serviceWorker?.controller ?? null;
}

/**
 * Schedule a notification via the service worker when scroll time expires.
 * @param {number} endTime - Unix ms timestamp when scrolling ends
 */
export async function scheduleScrollEndNotification(endTime) {
  // Request permission if we don't have it yet
  const permitted = await requestNotificationPermission();
  if (!permitted) return;

  const sw = getSW();
  if (sw) {
    sw.postMessage({ type: 'SCHEDULE_SCROLL_NOTIFICATION', endTime });
  }
}

/**
 * Cancel the scroll end notification (e.g., user came back early).
 */
export function cancelScrollEndNotification() {
  const sw = getSW();
  if (sw) {
    sw.postMessage({ type: 'CANCEL_SCROLL_NOTIFICATION' });
  }
}
