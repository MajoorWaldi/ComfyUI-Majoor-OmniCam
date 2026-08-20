# Examples & Workflows

## Canonical Payload Examples
- `omnicam_track.example.json`: Format canonique V1 d'une piste de caméra 3D.
- `omnicam_sequence.example.json`: Composition multi-plans de pistes V1 avec raccords et métadonnées.

## Workflows ComfyUI Prêts à l'Emploi (`examples/workflows/`)

Glissez-déposez directement ces fichiers JSON dans votre interface ComfyUI pour démarrer :

1. **`01_minimax_h3_omni_reference.json`** :
   - Pipeline officiel MiniMax Hailuo 03 Omni Reference.
   - Génère la vidéo de référence proxy + le prompt textuel dissociant géométrie et style.

2. **`02_wan21_native_camera_plucker.json`** :
   - Pipeline Wan 2.1 Native avec injection de rayons Plücker (`WAN_CAMERA_EMBEDDING`).
   - Format `4n+1` (81 frames) et résolution native (832×480).

3. **`03_wan21_ati_trajectory_control.json`** :
   - Pipeline Wan 2.1 VideoWrapper ATI (Any Trajectory Instruction).
   - Projection de trajectoires 2D spline avec preview sur l'image de départ.

4. **`04_ltx_video_ic_lora_guide.json`** :
   - Pipeline LTX-Video avec IC-LoRA Cameraman Guide.
   - Décodage des frames playblast et prompt cinématique universel.

5. **`05_universal_cinematic_director.json`** :
   - Pipeline Universel multi-modèles (Kling, Luma, Hunyuan, Wan, H3).
   - Extraction des passes de contrôle 3D (Depth, Normals, Optical Flow) et analyse dynamique JSON.
