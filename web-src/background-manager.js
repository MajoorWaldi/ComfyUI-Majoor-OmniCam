// Background image and image sequence manager for the OmniCam Director viewport.

export async function loadViewportBgFile(ui, file) {
  if (!file) return;
  try {
    const url = URL.createObjectURL(file);
    ui.state.viewport_bg_image = url;
    const img = new Image();
    img.src = url;
    await img.decode().catch(() => {});
    ui.viewportBgImage = img;
    ui.serialize();
    ui.render();
    ui.setStatus(`Background image set: ${file.name}`);
  } catch (err) {
    ui.setStatus(`Failed to load BG image: ${err.message || err}`);
  }
}

export async function loadViewportBgSequence(ui, files) {
  if (!files || !files.length) return;
  files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
  const urls = files.map((f) => URL.createObjectURL(f));
  ui.state.viewport_bg_sequence = urls;
  ui.state.viewport_bg_image = "";
  ui.viewportBgImage = null;
  ui.viewportBgSequenceImages = [];
  for (const url of urls) {
    const img = new Image();
    img.src = url;
    img.decode().catch(() => {});
    ui.viewportBgSequenceImages.push(img);
  }
  ui.serialize();
  ui.render();
  ui.setStatus(`Background sequence loaded: ${files.length} frames`);
}

export function clearViewportBgImage(ui) {
  ui.state.viewport_bg_image = "";
  ui.state.viewport_bg_sequence = [];
  ui.viewportBgImage = null;
  ui.viewportBgSequenceImages = [];
  ui.serialize();
  ui.render();
  ui.setStatus("Background cleared");
}
