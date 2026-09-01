/**
 * Requests that belong to a component, and end when it does.
 *
 * A ComfyUI node can be removed while one of its panels still has a fetch in
 * flight. The browser then reports `net::ERR_ABORTED` and the panel logs a
 * failure, which is misleading twice over: nothing failed, and the component
 * that would have handled it no longer exists.
 *
 * The distinction that matters is not "did the request fail" but "is anyone
 * still listening". These helpers make that explicit rather than leaving every
 * caller to guess from an error name.
 */

/** True when a rejection is a cancellation rather than a failure. */
export function isAbortError(error) {
  return error?.name === "AbortError" || error?.code === 20;
}

/**
 * Owns one AbortController per component and cancels it on disposal.
 *
 * Deliberately not one controller per request: the component's lifetime is the
 * thing being tracked, and a single signal is what makes "the node went away"
 * a single, testable event.
 */
export class RequestLifetime {
  constructor() {
    this.controller = typeof AbortController === "function" ? new AbortController() : null;
    this.disposed = false;
  }

  /** The signal to pass to fetch, or undefined where AbortController is absent. */
  get signal() {
    return this.controller?.signal;
  }

  get aborted() {
    return Boolean(this.controller?.signal?.aborted);
  }

  /** Merge the signal into fetch options without clobbering what the caller set. */
  options(init = {}) {
    return this.signal ? { ...init, signal: this.signal } : { ...init };
  }

  /**
   * Run a request, returning `undefined` when it was cancelled rather than throwing.
   *
   * Real failures still propagate: a dead network while the panel is alive is a
   * genuine error the caller has to see.
   */
  async run(task) {
    try {
      const result = await task(this.signal);
      return this.aborted ? undefined : result;
    } catch (error) {
      if (this.aborted || isAbortError(error)) return undefined;
      throw error;
    }
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.controller?.abort();
  }
}
