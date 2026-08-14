export class EditorHistory {
  constructor({ capture, restore, limit = 100 }) { this.capture = capture; this.restore = restore; this.limit = limit; this.undoStack = []; this.redoStack = []; this.restoring = false; }
  checkpoint(label = "Edit") { if (this.restoring) return; const snapshot = this.capture(); const previous = this.undoStack.at(-1); if (previous?.snapshot === snapshot) return; this.undoStack.push({ label, snapshot }); if (this.undoStack.length > this.limit) this.undoStack.shift(); this.redoStack.length = 0; }
  undo() { if (!this.undoStack.length) return null; const entry = this.undoStack.pop(); this.redoStack.push({ label: entry.label, snapshot: this.capture() }); this.restoring = true; try { this.restore(entry.snapshot); } finally { this.restoring = false; } return entry.label; }
  redo() { if (!this.redoStack.length) return null; const entry = this.redoStack.pop(); this.undoStack.push({ label: entry.label, snapshot: this.capture() }); this.restoring = true; try { this.restore(entry.snapshot); } finally { this.restoring = false; } return entry.label; }
  clear() { this.undoStack.length = 0; this.redoStack.length = 0; }
  get canUndo() { return this.undoStack.length > 0; }
  get canRedo() { return this.redoStack.length > 0; }
}

