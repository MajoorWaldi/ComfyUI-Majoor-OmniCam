// A group of DOM listeners with one lifetime.
//
// Every panel here has the same problem: it attaches listeners to elements it
// does not own (the node's root, the document, a widget) and must detach all of
// them exactly once when the node goes away. Tracking that by hand means a
// matching removeEventListener for every addEventListener, and one missed pair
// keeps a disposed panel alive for as long as the page lives.
//
// EventScope keeps the pair together: `on()` registers the listener and its
// own removal in the same call, and `dispose()` runs every removal once.
//
//   this.events = new EventScope();
//   this.events.on(button, "click", () => this.run());
//   ...
//   this.events.dispose();   // idempotent
export class EventScope {
  constructor() {
    this.disposers = [];
  }

  /** Attach a listener that `dispose()` will detach. A null target is a no-op. */
  on(target, type, handler, options) {
    if (!target?.addEventListener) return;
    target.addEventListener(type, handler, options);
    this.disposers.push(() => {
      try {
        target.removeEventListener(type, handler, options);
      } catch (_) {
        // A detached node or a closed document is already "removed".
      }
    });
  }

  /** Register a teardown that is not a DOM listener but shares this lifetime. */
  add(dispose) {
    if (typeof dispose === "function") this.disposers.push(dispose);
  }

  /** Detach everything. Safe to call more than once. */
  dispose() {
    for (const dispose of this.disposers.splice(0)) {
      try {
        dispose();
      } catch (_) {
        // One failed teardown must not strand the rest.
      }
    }
  }

  get size() {
    return this.disposers.length;
  }
}
