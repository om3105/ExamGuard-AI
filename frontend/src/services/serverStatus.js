/**
 * serverStatus.js — Lightweight global server-waking state manager.
 *
 * Used by the API client interceptors and UI overlay to coordinate
 * cold-start detection without React dependency.
 *
 * Usage:
 *   import serverStatus from '@/services/serverStatus';
 *   serverStatus.subscribe((waking) => console.log('waking:', waking));
 *   serverStatus.setWaking(true);
 */

let _isWaking = false;
let _retryCount = 0;
const _listeners = new Set();

const serverStatus = {
  /** @returns {boolean} Whether the backend appears to be cold-starting */
  get isWaking() {
    return _isWaking;
  },

  /** @returns {number} Current retry attempt number (0 = no retry in progress) */
  get retryCount() {
    return _retryCount;
  },

  /** Update waking state and notify all subscribers */
  setWaking(value) {
    if (_isWaking !== value) {
      _isWaking = value;
      if (!value) _retryCount = 0; // reset retry count when server is awake
      _listeners.forEach((fn) => fn({ isWaking: _isWaking, retryCount: _retryCount }));
    }
  },

  /** Update retry count and notify */
  setRetryCount(count) {
    _retryCount = count;
    _listeners.forEach((fn) => fn({ isWaking: _isWaking, retryCount: _retryCount }));
  },

  /**
   * Subscribe to state changes.
   * @param {(state: {isWaking: boolean, retryCount: number}) => void} callback
   * @returns {() => void} Unsubscribe function
   */
  subscribe(callback) {
    _listeners.add(callback);
    return () => _listeners.delete(callback);
  },
};

export default serverStatus;
