# Layout to Render starter assets

- `omnicam_layout_guide.webm`: an OmniCam proxy recording, 1436x743 at 24 fps,
  lasting five seconds. Workflow 10 uses its first 25 frames and resizes them.
- `omnicam_layout_look.png`: art-directed monolith reference generated with the
  built-in image generation tool from the guide's first frame.
- `result-preview.mp4`: the tested two-stage LTX-2.5 result, 25 frames at
  1280x640/24 fps. It demonstrates appearance transfer and visible guide motion.
- `validation.json`: the test configuration, timing and scope.

Upload the guide and look image into workflow 10's corresponding loaders.
Replace them for your own shot. The starter's authoring blockout approximates
the guide; it is not the original saved scene or a camera solve.

Image generation prompt: preserve the first frame's composition, camera angle,
perspective and rectangular silhouette in a sparse starfield; replace the
placeholder subject card with a photoreal dark-metal monolith with bevelled
edges, blue rim light and brushed bronze texture; remove all placeholder text,
person outlines and UI markings; retain the wide aspect ratio and add no objects.
The exact built-in tool prompt is saved in [look-generation-prompt.txt](look-generation-prompt.txt).

These assets contain no model weights. Model licences remain separate from the
MIT licence on OmniCam's code. See [LTX setup and limits](../../../docs/LTX.md).
