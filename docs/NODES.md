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

## Adaptateur ATI : résolution et visibilité

`WanVideoATITracks` normalise les coordonnées avec **ses propres** widgets
`width`/`height` (`process_tracks` fait `(xy - taille/2) / min(taille) * 2`).
Écrire des pixels 1280×720 dans un node resté à 832×480 décale et rééchelonne
silencieusement toutes les trajectoires. Le node OmniCam expose donc `width` et
`height` en entrée **et en sortie** : câblez-les vers `WanVideoATITracks`.

`pad_pts` force la visibilité à 1 pour chaque point fourni et complète à 121
avec des zéros (visibilité 0). La seule façon de dire « ce point est sorti du
champ » est donc d'arrêter la liste : OmniCam tronque la trajectoire à la
première image invisible au lieu de la plaquer sur le bord, ce qui aurait
demandé au modèle de suivre un point glissant le long du cadre. Un point non
visible dès l'image 0 n'ouvre pas de trajectoire, faute de pouvoir exprimer une
apparition différée.

L'aperçu ATI dessine désormais les trajectoires **réellement exportées**, avec
un rayon croissant de l'ancien vers le récent, comme le visualiseur de
WanVideoWrapper.

## Échange de caméra

Export vers `.glb`/`.gltf`, `.usda` et `.chan` ; import depuis `.gltf`, `.glb`,
`.fbx`, `.chan` et JSON OmniCam/Blender. Les fichiers écrits atterrissent sous
`output/omnicam/exports/`. Tout est baké image par image : les interpolations
d'OmniCam (ease, smooth, bezier, hold) n'ont aucun équivalent dans ces formats,
donc n'écrire que les clés changerait la courbe reçue. Le glTF embarque en plus
la piste canonique dans `extras.omnicam`, ce qui rend le retour dans OmniCam
strictement sans perte.

OBJ n'est pas proposé : le format ne connaît ni caméra, ni temps, ni champ de
vision. FBX est lu mais pas écrit — l'export passe par glTF ou USD, qui
atteignent les mêmes logiciels.

## Mode de rendu `beauty`

Le viewport d'édition est éclairé (IBL, rig trois points, ombre de contact,
tone mapping ACES). Ce look s'arrête au playblast : tous les modes proxy
enregistrent le rendu neutre. Seul `beauty` conserve l'éclairage dans la vidéo
enregistrée — à réserver aux cas où l'on veut une référence jolie, en sachant
qu'un modèle de conditionnement peut alors copier l'apparence en plus du
mouvement.

## Composants non publics

- Scene Motion Analysis : données géométriques de centres projetés, pas de
  véritables passes pixels ;
- `core/camera_tools.py` : bibliothèque interne utilisée par les adaptateurs,
  exposée par aucun node.

Le Sequencer, les nodes Sequence/EDL et Track Sampler/Camera Tools, le modèle de
données de séquence, le montage audio/vidéo et les exports DCC (Blender/Unreal)
ont été retirés du paquet livré : ils n'étaient atteignables depuis aucun des
cinq nodes publics. Leur historique reste dans git.

## Compatibilité minimale

OmniCam utilise actuellement `comfy_api.latest` car le contrat V3 nécessaire
(`IO.Schema`, `IO.Video`, `IO.WanCameraEmbedding`, Node Replacement) n’est pas
entièrement fourni par l’adapter stable `v0_0_2`. La version minimale déclarée
et testée est donc ComfyUI `0.31.0`, qui embarque
`comfyui-frontend-package>=1.48.7`. Cette dernière n'est volontairement **pas**
déclarée dans `dependencies` : installer OmniCam ne doit pas pouvoir mettre à
jour le frontend de l'installation hôte. La CI exécute également un import réel de
l’extension, son hook `on_load()` et `define_schema()` sur chacun des cinq nodes,
sur la version minimale ainsi que sur la branche courante de ComfyUI.
