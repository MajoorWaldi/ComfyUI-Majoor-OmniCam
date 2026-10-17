// Invalidate observations synchronously, including restores which do not serialize.
export function invalidateDirectorRevision(ui) {
  ui.directorRevision = (Number.isInteger(ui.directorRevision) ? Math.max(0, ui.directorRevision) : 0) + 1;
}
