// Pure keyframe lookup shared by camera and object edit sessions.

export function findEditableKey(keyframes, frame, selectedFrame = null, editingFrame = null) {
  const keys = Array.isArray(keyframes) ? keyframes : [];
  return keys.find((item) => item.frame === frame)
    || (selectedFrame !== null ? keys.find((item) => item.frame === selectedFrame) : null)
    || (editingFrame !== null ? keys.find((item) => item.frame === editingFrame) : null)
    || null;
}
