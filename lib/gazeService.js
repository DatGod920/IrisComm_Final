/**
 * gazeService — thin wrapper around GazeCloudAPI (vendor global).
 *
 * - Normalizes doc coordinates to viewport-relative x,y in [0, 1].
 * - Exposes onGaze(x, y). No React, no DOM/CSS, no hit-testing.
 *
 * Host must load GazeCloudAPI.js first (e.g. <script src="…"> or your bundler).
 *
 * @typedef {Object} GazeCloudResult
 * @property {-1|0|1} state  -1 = lost / invalid; 0 = calibrated; 1 = not calibrated (vendor-specific)
 * @property {number} docX
 * @property {number} docY
 * @property {number} [time]
 *
 * @typedef {Object} GazeCloudAPILike
 * @property {() => void} StartEyeTracking
 * @property {() => void} StopEyeTracking
 * @property {((data: GazeCloudResult) => void) | null} OnResult
 * @property {(() => void) | null} [OnCalibrationComplete]
 * @property {(() => void) | null} [OnCamDenied]
 * @property {((message: string) => void) | null} [OnError]
 * @property {boolean} [UseClickRecalibration]
 *
 * @typedef {Object} GazeServiceCallbacks
 * @property {(x: number, y: number) => void} [onGaze] normalized viewport; not called when state === -1
 * @property {(message: string) => void} [onError]
 * @property {() => void} [onCalibrationComplete]
 * @property {() => void} [onCamDenied]
 */

const ROOT = typeof globalThis !== "undefined" ? globalThis : {};

/** @type {GazeCloudAPILike | null} */
let _api = null;

/** @type {GazeServiceCallbacks} */
let _callbacks = {};

/**
 * @param {number} v
 * @returns {number}
 */
function clamp01(v) {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

/**
 * Map GazeCloud doc coordinates to normalized viewport fractions.
 * @param {number} docX
 * @param {number} docY
 * @returns {{ x: number, y: number }}
 */
export function normalizeGazeToViewport(docX, docY) {
  const w = Math.max(ROOT.innerWidth || 1, 1);
  const h = Math.max(ROOT.innerHeight || 1, 1);
  return {
    x: clamp01(docX / w),
    y: clamp01(docY / h),
  };
}

/**
 * @param {GazeCloudResult} gazeData
 */
function handleResult(gazeData) {
  if (gazeData.state === -1) return;
  const fn = _callbacks.onGaze;
  if (typeof fn !== "function") return;
  const { x, y } = normalizeGazeToViewport(gazeData.docX, gazeData.docY);
  fn(x, y);
}

/**
 * Register user callbacks. Safe to call before `wireGazeCloudAPI`.
 * @param {GazeServiceCallbacks} options
 */
export function setGazeCallbacks(options = {}) {
  _callbacks = {
    onGaze: options.onGaze,
    onError: options.onError,
    onCalibrationComplete: options.onCalibrationComplete,
    onCamDenied: options.onCamDenied,
  };
}

/**
 * Current global API if the SDK script has already executed.
 * @returns {GazeCloudAPILike | null}
 */
export function resolveGazeCloudAPI() {
  return ROOT.GazeCloudAPI ?? null;
}

/**
 * Poll until `window.GazeCloudAPI` exists or timeout. No DOM APIs.
 * @param {{ pollMs?: number, timeoutMs?: number }} [opts]
 * @returns {Promise<GazeCloudAPILike | null>}
 */
export function waitForGazeCloudAPI(opts = {}) {
  const pollMs = opts.pollMs ?? 50;
  const timeoutMs = opts.timeoutMs ?? 60_000;
  const existing = resolveGazeCloudAPI();
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve) => {
    const t0 = ROOT.performance?.now?.() ?? Date.now();
    const tick = () => {
      const api = resolveGazeCloudAPI();
      if (api) {
        resolve(api);
        return;
      }
      const elapsed = (ROOT.performance?.now?.() ?? Date.now()) - t0;
      if (elapsed >= timeoutMs) {
        resolve(null);
        return;
      }
      ROOT.setTimeout?.(tick, pollMs);
    };
    tick();
  });
}

function clearVendorHandlers() {
  if (!_api) return;
  _api.OnResult = null;
  _api.OnCalibrationComplete = null;
  _api.OnCamDenied = null;
  _api.OnError = null;
}

/**
 * Attach normalized gaze handling to a GazeCloud API instance.
 * @param {GazeCloudAPILike} api
 */
export function wireGazeCloudAPI(api) {
  if (!api || typeof api.StartEyeTracking !== "function") {
    throw new Error("gazeService.wireGazeCloudAPI: invalid API (expected StartEyeTracking)");
  }
  if (_api && _api !== api) {
    clearVendorHandlers();
  }
  _api = api;
  if (typeof _api.UseClickRecalibration === "boolean") {
    _api.UseClickRecalibration = false;
  }
  _api.OnResult = handleResult;
  _api.OnCalibrationComplete = () => {
    const fn = _callbacks.onCalibrationComplete;
    if (typeof fn === "function") fn();
  };
  _api.OnCamDenied = () => {
    const fn = _callbacks.onCamDenied;
    if (typeof fn === "function") fn();
  };
  _api.OnError = (message) => {
    const fn = _callbacks.onError;
    if (typeof fn === "function") fn(message ?? "");
  };
}

/**
 * Convenience: wait for global API, wire handlers, then start tracking.
 * @param {GazeServiceCallbacks} [callbacks]
 * @returns {Promise<GazeCloudAPILike | null>}
 */
export async function initGazeService(callbacks) {
  setGazeCallbacks(callbacks ?? {});
  const api = await waitForGazeCloudAPI();
  if (!api) return null;
  wireGazeCloudAPI(api);
  return api;
}

export function startGazeTracking() {
  _api?.StartEyeTracking?.();
}

export function stopGazeTracking() {
  if (!_api) return;
  try {
    _api.StopEyeTracking?.();
  } catch {
    /* vendor SDK may throw if already stopped */
  }
}

/**
 * Remove handlers and drop API reference. Call `stopGazeTracking` first if tracking is active.
 */
export function disconnectGazeService() {
  clearVendorHandlers();
  _api = null;
}
