# OmniCam — guide des nodes publics

Ce document décrit exclusivement les nodes actuellement enregistrés par
OmniCam. Le registre public contient cinq nodes. Le Sequencer, les analyses de
scène et les transferts DCC restent internes ou désactivés.

## Flux canonique

```text
OmniCam Director → MAJOOR_OMNICAM_TRACK → adapter modèle
                 ↘ proxy_video
                 ↘ shot_collection
```

Le Track est la source de vérité. Les adapters ne lisent pas directement
l’état interne du viewport.

## OmniCam Director

Identifiant : `MajoorOmniCamDirector`

Éditeur de layout caméra, objets proxy, animation, timeline et playblast.

Entrées utilisateur principales : résolution, FPS, durée, mode de rendu,
image/vidéo/audio et scène 3D optionnelles. `state_json`, `recording_path` et
`card_asset` sont des champs avancés gérés par l’interface.

Sorties :

- `camera_track` — Track canonique de la caméra active ;
- `proxy_video` — playblast ou vidéo connectée ;
- `audio` — audio associé ;
- `shot_collection` — toutes les caméras du Director et leurs proxies.

Le Director ne produit plus `camera_info`, `track_json`, `sequence`,
`shots_json` ou `director_shot`. Pour une preview vidéo, il lit les métadonnées
puis décode au plus 32 images uniformes via des plages `VIDEO.as_trimmed()`.

## Universal Reference & AI Prompts

Identifiant : `MajoorOmniCamH3Adapter`

Produit une vidéo de référence caméra, un fragment de prompt, un prompt
cinématique et l’analyse JSON du trajet. Le proxy est décrit explicitement
comme référence de mouvement seulement : sa géométrie et son apparence ne
doivent pas être copiées.

L’analyse utilise tout le trajet : translations locales dolly/truck/crane,
orbite signée, distance parcourue, rotation, vitesse, accélération, jerk,
courbure et variations optiques. Truck reste une translation latérale et crane
une translation verticale ; ces termes ne sont jamais remplacés par pan/tilt.
L'analyse reste indépendante des templates de prompt et expose une classification
multi-tag (`primary`, `secondary`, `optical`, `compound`) pour les mouvements
composés, le pan, le tilt, le roll, le zoom optique et les plans verrouillés.

## Wan Native Camera

Identifiant : `MajoorOmniCamWanNativeCamera`

Convertit le Track en `WAN_CAMERA_EMBEDDING`. La longueur doit respecter
`4n+1`. La sortie se connecte à l’entrée `camera_conditions` du node Wan natif.

## LTX Camera Guide

Identifiant : `MajoorOmniCamLTXCameraGuide`

Produit :

- `guide_frames` — batch IMAGE borné ;
- `cinematic_prompt` ;
- `camera_profile_json`.

Le node calcule la plage et le budget mémoire avant décodage, puis utilise
`VIDEO.as_trimmed()`. Il reconnaît les classes LTX actuelles
`LTXAddVideoICLoRAGuide` et `LTXAddVideoICLoRAGuideAdvanced`, ainsi que les
anciens alias à des fins de diagnostic.
`camera_profile_json.guide_diagnostics` indique le type IMAGE, le nombre de
frames, la résolution et l'estimation mémoire du guide décodé.

## WanVideoWrapper ATI

Identifiant : `MajoorOmniCamWanVideoWrapperATI`

Projette des points 3D stables et retourne la chaîne `tracks` consommée par
`WanVideoATITracks`. Le même contrat STRING est détecté pour le node natif
`WanTrackToVideo`, sans prétendre qu’une intégration est vérifiée lorsque seule
sa classe est présente.

L’ancien `MajoorOmniCamWanATIAdapter` dispose d’un Node Replacement officiel
vers ce node ; son ancienne sortie JSON est remappée vers `tracks`.

## Capacités et compatibilité

`ADAPTER_INFO` est l’unique registre. Les états runtime sont :

- `missing` ;
- `detected_unverified` ;
- `verified` ;
- `incompatible`.

La vérification inspecte les sockets exposées par les classes installées. Une
simple présence de classe ne suffit pas à annoncer une version épinglée ou une
compatibilité vérifiée.

## Composants non publics

- OmniCam Sequencer : désactivé pendant sa refonte éditoriale v2 ;
- Scene Motion Analysis : données géométriques de centres projetés, pas de
  véritables passes pixels ;
- Blender/Unreal Camera Transfer : expérimental, non lossless ;
- Track Sampler, Camera Tools, DCC Export et anciens nodes Sequence : internes.

## Compatibilité minimale

OmniCam utilise actuellement `comfy_api.latest` car le contrat V3 nécessaire
(`IO.Schema`, `IO.Video`, `IO.WanCameraEmbedding`, Node Replacement) n’est pas
entièrement fourni par l’adapter stable `v0_0_2`. La version minimale déclarée
et testée est donc ComfyUI `0.31.0`, avec
`comfyui-frontend-package>=1.48.7`. La CI exécute également un import réel de
l’extension, son hook `on_load()` et `define_schema()` sur chacun des cinq nodes,
sur la version minimale ainsi que sur la branche courante de ComfyUI.
