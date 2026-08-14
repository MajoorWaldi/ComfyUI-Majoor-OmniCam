class i {
  constructor({ capture: t, restore: s, limit: e = 100 }) {
    this.capture = t, this.restore = s, this.limit = e, this.undoStack = [], this.redoStack = [], this.restoring = !1;
  }
  checkpoint(t = "Edit") {
    if (this.restoring) return;
    const s = this.capture();
    this.undoStack.at(-1)?.snapshot !== s && (this.undoStack.push({ label: t, snapshot: s }), this.undoStack.length > this.limit && this.undoStack.shift(), this.redoStack.length = 0);
  }
  undo() {
    if (!this.undoStack.length) return null;
    const t = this.undoStack.pop();
    this.redoStack.push({ label: t.label, snapshot: this.capture() }), this.restoring = !0;
    try {
      this.restore(t.snapshot);
    } finally {
      this.restoring = !1;
    }
    return t.label;
  }
  redo() {
    if (!this.redoStack.length) return null;
    const t = this.redoStack.pop();
    this.undoStack.push({ label: t.label, snapshot: this.capture() }), this.restoring = !0;
    try {
      this.restore(t.snapshot);
    } finally {
      this.restoring = !1;
    }
    return t.label;
  }
  clear() {
    this.undoStack.length = 0, this.redoStack.length = 0;
  }
  get canUndo() {
    return this.undoStack.length > 0;
  }
  get canRedo() {
    return this.redoStack.length > 0;
  }
}
export {
  i as EditorHistory
};
