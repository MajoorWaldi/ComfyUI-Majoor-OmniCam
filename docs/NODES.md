# OmniCam — guide des nodes publics

Ce document décrit exclusivement les nodes actuellement enregistrés par
OmniCam. Le registre contient trois nodes produit et quatre nodes de
compatibilité dépréciés. Le Sequencer, les analyses de scène et les transferts
DCC restent internes ou désactivés.

## Flux canonique

```text
OmniCam Extractor → OmniCam Director → MAJOOR_OMNICAM_TRACK → OmniCam Monitor → adapter modèle
                                      ↘ proxy_video        ↗
                                      ↘ shot_collection
```

Le Track est la source de vérité. Les adapters ne lisent pas directement
l’état interne du viewport.

## Sockets média : VIDEO ou IMAGE

Chaque socket OmniCam qui transporte des images — `image` et `video` du
Director, `video` de l’Extractor, `proxy_video` du Monitor et des nodes de
compatibilité — est un socket multi-types `VIDEO,IMAGE`. Un lot d’images
généré par le graphe se branche donc sans node `ImageToVideo` intermédiaire.

La conversion a lieu à la frontière du node, dans `omnicam/nodes/media.py` :

| Branché | Attendu | Conversion |
|---|---|---|
| `IMAGE` | vidéo | enveloppe en mémoire, lue au FPS du node, sinon 24 |
| `VIDEO` | images | échantillonnage borné, jamais un décodage complet |
| `IMAGE` | source solvable | encodée d’abord sous `temp/omnicam/extractor_runtime/`, car un solve a besoin de chercher dans un fichier |

Le schéma canonique et les adaptateurs ne changent pas : la conversion produit
exactement les mêmes objets que ceux déjà attendus en aval.

### Les sorties vidéo ont un jumeau IMAGE

Une sortie ne renvoie qu’une seule valeur concrète à l’exécution : un socket de
sortie « VIDEO ou IMAGE » n’existe pas dans ComfyUI, et un node en aval qui
attendrait l’un recevrait parfois l’autre. `IO.MultiType` ne définit d’ailleurs
qu’un `Input`, jamais d’`Output`.

À la place, chaque sortie qui produit une vidéo de proxy ou de référence est
accompagnée d’une seconde sortie `IMAGE` : `proxy_frames` sur le Director,
`reference_frames` sur le Monitor et sur le node de compatibilité H3 déprécié.
Chaque jumeau est un échantillon borné et uniforme de la vidéo voisine — jamais
un décodage complet — et devient `None` plutôt que de faire échouer le node si
cette vidéo n’est pas échantillonnable. Il suffit de brancher la sortie voulue ;
aucun aval n’a besoin des deux.

## OmniCam Director

Identifiant : `MajoorOmniCamDirector`

Éditeur de layout caméra, objets proxy, animation, timeline et playblast.

Entrées utilisateur principales : résolution, FPS, durée, mode de rendu,
image/vidéo/audio et scène 3D optionnelles — `image` et `video` acceptent
l’un ou l’autre type. `state_json`, `recording_path` et
`card_asset` sont des champs avancés gérés par l’interface.

Sorties :

- `camera_track` — Track canonique de la caméra active ;
- `proxy_video` — playblast ou vidéo connectée ;
- `audio` — audio associé ;
- `shot_collection` — toutes les caméras du Director et leurs proxies ;
- `proxy_frames` — jumeau `IMAGE` borné de `proxy_video`, `None` sans proxy.

Le Director ne produit plus `camera_info`, `track_json`, `sequence`,
`shots_json` ou `director_shot`. Pour une preview vidéo, il lit les métadonnées
puis décode au plus 32 images uniformes via des plages `VIDEO.as_trimmed()`.

### Densité d’interface : Basic, Animation, Advanced

Le sélecteur `Interface` du menu `View` (et des réglages ComfyUI) choisit la
quantité de chrome affichée, sur le modèle du « Simplify » de Blender ou des
niveaux d’interface de Maya — une divulgation progressive, pas trois mises en
page différentes.

| Palier | Ajoute |
|---|---|
| `Basic` | placement objets/caméras, keyframing, lecture, playblast |
| `Animation` | import/export caméra, bake d’aim, panneau Health, éditeur de courbes, presets de sortie |
| `Advanced` | tout : sélection sub-object, snapping spatial, overlays de diagnostic, fonds statiques, maintenance du cache |

Le sélecteur lui-même n’est jamais masqué par son propre réglage. Quitter un
onglet qu’un palier inférieur masque (Health, en Basic) revient sur l’Outliner
plutôt que d’afficher un panneau vide.

## OmniCam Extractor

Les actions TRACK, PAUSE, RESUME et STOP sont dans le transport du lecteur.
SOURCE montre la video geree propre. COMPARE synchronise la frame propre, la
frame avec les points live du solve et le viewport 3D. Les points sont des
diagnostics ephemeres : ils ne sont ni serialises dans le workflow ni ajoutes
au MAJOOR_OMNICAM_TRACK.

Identifiant : `MajoorOmniCamExtractor`

Estime une trajectoire caméra 6DoF **relative** à partir d’un plan vidéo
continu et émet un Track canonique schema v1.

Entrées :

| Entrée | Défaut | Rôle |
|---|---|---|
| `video` | — | Un seul plan continu, `VIDEO` ou lot `IMAGE`. Une coupe franche est signalée, jamais recollée. |
| `method` | `auto` | `auto`, `dpvo` ou `opencv_sift`. |
| `lens_mode` | `auto` | `auto` (53° vertical documenté), `fov` ou `focal_mm`. |
| `fov_degrees` | `53.0` | FOV vertical, utilisé si `lens_mode=fov`. |
| `focal_length_mm` | `24.0` | Focale, utilisée si `lens_mode=focal_mm`. |
| `sensor_width_mm` | `36.0` | Largeur capteur, utilisée si `lens_mode=focal_mm`. |
| `max_dimension` | `960` | Bord long des images envoyées au solveur. Jamais d’upscale. |
| `frame_step` | `1` | Échantillonnage. Les clés gardent les numéros de frames **source**. |
| `normalize_origin` | `True` | Place la frame 0 à l’origine, orientation identité. |
| `motion_scale` | `1.0` | Met la translation à l’échelle de la scène. N’affecte jamais la rotation. |
| `position_smoothing` | `0.15` | Lissage centré, sans retard temporel. `0` = solve brut. |
| `rotation_smoothing` | `0.10` | Moyenne quaternion pondérée, après continuité de signe. |
| `simplify_keys` | `True` | Réduction de clés tenant compte position **et** orientation. |
| `position_tolerance` | `0.01` | Erreur de position admise. `0` = sans perte. |
| `rotation_tolerance_deg` | `0.25` | Erreur angulaire admise. `0` = sans perte. |

Sorties :

- `camera_track` — Track canonique `MAJOOR_OMNICAM_TRACK` ;
- `confidence` — **couverture du solveur**, pas une précision physique ;
- `report` — résumé lisible (backend, clés, objectif, avertissements).

Limites assumées en V1 : pas d’échelle métrique, pas de focale animée, pas de
distorsion, pas de rolling shutter, pas de solve multi-plans, pas de capture
d’objets ou de personnages.

### Panneau de solve interactif

Le node Extractor embarque un panneau de matchmove. `▶ TRACK` lance le solve
**sans passer par la file de prompts ComfyUI** : aucune exécution de graphe,
aucun modèle chargé.

États du job :

```text
IDLE → PREPARING → TRACKING → SOLVING → REFINING → COMPLETED
TRACKING/SOLVING → PAUSING → PAUSED → TRACKING/SOLVING
tout état actif → STOPPING → STOPPED
tout état actif → FAILED
```

`PAUSING` signifie « demandé », `PAUSED` signifie « le worker s’est
réellement arrêté à un point de contrôle ». La pause et l’arrêt sont
coopératifs : aucun thread n’est tué, aucun contexte CUDA n’est détruit de
force.

Un solve `STOPPED` ou `FAILED` ne produit **jamais** de track final :
`APPLY REFINED` reste désactivé.

### Sources acceptées sans Run

| Source | Interactif |
|---|---|
| `Load Video` natif connecté | oui |
| Fichier choisi via `Choose Video` | oui |
| `Create Video` / VIDEO ou IMAGE généré en mémoire, avant sa première exécution | non, raison affichée |
| VIDEO runtime après exécution normale de l’Extractor | oui, copie gérée `[temp]` |
| Node VIDEO tiers inconnu, après matérialisation par l’Extractor | oui, référence `[temp]` |

Les noms de widgets de nodes tiers ne sont jamais devinés. Le panneau ne met
jamais silencieusement le graphe en file d’attente.

Lors d’une exécution normale, une source qui n’est pas déjà un fichier géré —
VIDEO runtime ou lot IMAGE — est encodée sous `temp/omnicam/extractor_runtime/` avec un nom UUID. L’enveloppe UI
contient uniquement la référence annotée, jamais le chemin absolu. Le player,
la timeline et le viewer 3D acceptent ce résultat par le même chemin que le
solve interactif.

### Routes no-run

```text
POST   /majoor/omnicam/extractor/source
POST   /majoor/omnicam/extractor/jobs
GET    /majoor/omnicam/extractor/jobs/{job_id}
POST   /majoor/omnicam/extractor/jobs/{job_id}/pause
POST   /majoor/omnicam/extractor/jobs/{job_id}/resume
POST   /majoor/omnicam/extractor/jobs/{job_id}/stop
POST   /majoor/omnicam/extractor/jobs/{job_id}/refine
GET    /majoor/omnicam/extractor/jobs/{job_id}/result
DELETE /majoor/omnicam/extractor/jobs/{job_id}
POST   /majoor/omnicam/upload_extractor_source
```

`/extractor/source` mesure une source sans rien démarrer : le panneau a besoin de la cadence et du nombre d’images avant le premier solve, sinon son scrubber n’a aucune plage.

Événements WebSocket : `majoor.omnicam.extractor.{job,progress,pose,quality,features,completed,failed}`,
limités à environ 10 Hz **par canal** (un compteur global laissait le premier
canal déclenché faire taire les autres dans la même fenêtre). Le WebSocket est
un transport, pas un état : `GET /jobs/{id}` reste la source de vérité après une
déconnexion.

`features` porte les points suivis d’une image — au plus 240, échantillonnés sur
toute l’image, normalisés dans le carré unité et marqués `accepted`/`rejected`
selon le masque d’inliers. Purement d’affichage : ils ne sont jamais stockés sur
le job, car un overlay ne décrit qu’une image et les garder toutes croîtrait
sans borne sur un plan long.

### Timeline de track

Sous le solve, le panneau dessine les canaux que le solve a produits — Camera,
Look At, Focal Length, Roll — en losanges, sur le même axe d’images que la
vidéo. Une clé n’est posée que là où **son** canal change : un objectif qui ne
bouge pas affiche une seule clé, pas une par image.

Deux bandes la surmontent et ne disent pas la même chose :

* **SOLVE** — la santé du tracker (couverture, inliers) : est-ce qu’il *voyait* ?
* **MOTION** — `motion_health`, la même notation que le panneau Health du
  Director, contre les limites de l’adaptateur choisi : la caméra obtenue est-
  elle *tournable* ?

Un solve vert avec un MOTION rouge est un cas réel — un track propre d’une
caméra trop rapide pour le modèle visé — et c’est exactement ce qu’une barre
unique masquerait. La bande MOTION suit RAW/REFINED : noter le track raffiné
pendant que l’utilisateur regarde le brut serait une réponse fausse en silence.

La timeline ne modifie rien : l’Extractor corrige par Refine, et une timeline
éditable serait un second éditeur en désaccord silencieux avec le premier.

### Raffinement non destructif

Le solve brut est **immuable**. Chaque réglage redérive un track à partir de
lui, sans décodage vidéo ni solveur :

```text
raw → actions spikes → trim → origine → alignement global
    → échelle → continuité quaternion → lissage → réduction de clés → track
```

L’alignement est **global** : un seul offset pitch/yaw/roll pour tout le solve,
jamais par clé. La détection de spikes utilise médiane et MAD, donc une caméra
rapide mais régulière n’est pas signalée.

`APPLY REFINED` écrit le résultat dans l’état sérialisé du node et prévient
le Director connecté. Modifier un réglage ensuite marque le résultat
`OUTDATED` jusqu’au prochain Apply : le Director n’est jamais écrasé pendant
que l’utilisateur expérimente.

### Backends

DPVO ([princeton-vl/DPVO](https://github.com/princeton-vl/DPVO), licence MIT)
et OpenCV/SIFT sont **optionnels** et importés paresseusement : OmniCam se
charge normalement sans eux. Le checkpoint DPVO est lu à un emplacement géré et
non configurable :

```text
ComfyUI/models/omnicam/dpvo/dpvo.pth
```

OmniCam n’installe jamais de paquet Python à l’exécution. Aucun code ni aucune
configuration DPVO n’est redistribué dans ce paquet — l’intégration se fait par
import à l’exécution — donc `THIRD_PARTY_NOTICES.md`, qui décrit uniquement le
bundle `web/omnicam.js`, reste inchangé.

Chaque solve DPVO est exécuté dans un processus `spawn` jetable. Les images
échantillonnées sont écrites progressivement dans un `.npy` memmap privé sous
le temp ComfyUI. Succès, erreur, annulation et arrêt serveur ferment le pipe,
rejoignent le processus et suppriment l’échange. La VRAM CUDA appartient donc
au processus enfant et redescend quand son PID disparaît. Pendant le solve,
DPVO publie la frame source courante mais aucune pose provisoire : sa trajectoire
n’est valide qu’après `terminate()`.

### Entrée `camera_track` du Director

Le Director expose une entrée optionnelle `camera_track`. La règle est une
importation par empreinte (`extractor_fingerprint`) :

- pas de câble → l’état local du Director ;
- empreinte déjà importée → l’état local, **éditions comprises** ;
- empreinte inconnue → le mouvement caméra amont, dans le contexte de scène et
  de rendu du Director.

Résolution, mode de rendu, objets, contraintes et métadonnées de scène restent
au Director. Débrancher le câble fige la trajectoire importée.

## OmniCam Monitor

Identifiant : `MajoorOmniCamMonitor`

Étape de contrôle qualité, préflight et livraison du Track canonique. Monitor
observe le Director sans lancer le graphe : une modification amont passe
immédiatement l’état à `OUTDATED`, puis Live Sync appelle après 250 ms la route
légère `/majoor/omnicam/monitor/snapshot`. Refresh appelle la même route. Aucun
de ces chemins ne charge de modèle, ne construit `WAN_CAMERA_EMBEDDING` et ne
matérialise le batch IMAGE LTX.

Monitor réutilise le lecteur d’assets gérés et la timeline read-only de
l’Extractor. La timeline montre les lanes Camera, Look At, Focal Length et Roll
sur le même axe que le proxy. Le watcher compare directement les widgets
`state_json` et `recording_path` ; il ne reparse la track que lorsqu’ils changent.

Entrées :

| Entrée | Défaut | Rôle |
|---|---|---|
| `camera_track` | — | Track canonique produit par Director. |
| `proxy_video` | optionnel | Proxy géré utilisé par H3 et LTX, `VIDEO` ou lot `IMAGE`. |
| `adapter` | `h3` | `h3`, `wan_native`, `wan_ati`, `wan_tracks_native` ou `ltx`. |
| `base_prompt` | vide | Intention utilisateur conservée dans le prompt final. |
| `video_ref_token` | `<Video 1>` | Jeton de référence H3. |
| `width`, `height`, `length` | `832`, `480`, `81` | Dimensions et longueur de l’adapter. |
| `point_count`, `distribution` | `16`, `balanced` | Projection des trajectoires ATI. |
| `ltx_max_frames`, `ltx_sampling_mode` | `121`, `contiguous` | Plan d’échantillonnage LTX borné. |

Sorties stables : `reference_video`, `camera_prompt`, `cinematic_prompt`,
`final_prompt`, `camera_data_json`, `wan_camera`, `tracks`, `adapter_width`,
`adapter_height`, `adapter_length`, `guide_frames`, `adapter_profile_json` et
`reference_frames` (jumeau `IMAGE` borné de `reference_video`). Seules les
sorties de l’adapter sélectionné sont calculées ; les sorties lourdes inactives
valent `None`.

La vue H3 réutilise le proxy réel. ATI et native Wan tracks affichent les
coordonnées exactes livrées. LTX affiche les indices exacts du plan de sampling.
Wan Native affiche uniquement un chemin caméra marqué `DIAGNOSTIC`, car
l’embedding final n’existe qu’après l’exécution normale du node.

Les quatre anciens nodes adapters restent chargeables pour les workflows
existants, dans `Majoor/OmniCam/Legacy` avec `is_deprecated=True`. Ils conservent
leur comportement d’exécution, mais les nouveaux graphes doivent passer par
Monitor.

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
nodes publics. Leur historique reste dans git.

## Compatibilité minimale

OmniCam utilise actuellement `comfy_api.latest` car le contrat V3 nécessaire
(`IO.Schema`, `IO.Video`, `IO.WanCameraEmbedding`, Node Replacement) n’est pas
entièrement fourni par l’adapter stable `v0_0_2`. La version minimale déclarée
et testée est donc ComfyUI `0.31.0`, qui embarque
`comfyui-frontend-package>=1.48.7`. Cette dernière n'est volontairement **pas**
déclarée dans `dependencies` : installer OmniCam ne doit pas pouvoir mettre à
jour le frontend de l'installation hôte. La CI exécute également un import réel de
l’extension, son hook `on_load()` et `define_schema()` sur chacun des six nodes,
sur la version minimale ainsi que sur la branche courante de ComfyUI.

## Installation DPVO sous Windows

L installation officielle DPVO est une compilation depuis les sources : depot
avec sous-modules, Eigen 3.4.0, puis `pip install .` pour compiler les
extensions CUDA. Il n existe pas de wheel Windows portable fournie par DPVO.
L extension doit etre compilee contre le PyTorch de l environnement ComfyUI
lui-meme : une extension CUDA est liee a l ABI de son PyTorch, donc un `dpvo`
construit dans un environnement conda separe (fork Windows, WSL2) n est pas
importable par le python embarque de ComfyUI.

Deux prerequis seulement : Visual Studio 2022 avec la charge de travail
« Developpement Desktop en C++ », et un GPU NVIDIA.

Le cas d echec courant est PyTorch `+cu130` avec un toolkit systeme CUDA 12.x :
`torch.utils.cpp_extension` s arrete sur `CUDA version mismatch` des que la
version majeure de `nvcc` differe. Ne remplacez pas le PyTorch de ComfyUI pour
contourner ce controle. Il n est pas non plus necessaire d installer le toolkit
CUDA complet : NVIDIA publie chaque composant separement sur
`developer.download.nvidia.com/compute/cuda/redist`, et `nvcc` plus les en-tetes
suffisent a construire un `CUDA_HOME` local, sans droits administrateur.

Les sources upstream demandent par ailleurs cinq correctifs pour MSVC et pour
PyTorch 2.x : `.type()` -> `.scalar_type()` dans les macros `AT_DISPATCH_*`,
suppression de `torch/extension.h` dans les unites de compilation device (ses
en-tetes dynamo declenchent `C2872: 'std': ambiguous symbol` sous nvcc), `long`
-> `int64_t` pour les index de tenseurs (`long` fait 32 bits sous MSVC), les
litteraux composes GNU de `ba_cuda.cu`, et l `__init__.py` absent de
`dpvo/loop_closure`. `dpvo/net.py` importe enfin `torch_scatter`, autre
extension CUDA a compiler avec la meme chaine.

Cette procedure est scriptee et reproductible dans `.dpvo-install/`, dont le
`README.md` decrit la sequence complete ; ce dossier n est pas versionne.

Si ces prerequis ne sont pas reunis, utilisez `method=opencv_sift` (ou
`method=auto`, qui retombe sur OpenCV/SIFT). Dans tous les cas, DPVO attend
egalement le checkpoint `ComfyUI/models/omnicam/dpvo/dpvo.pth`. OmniCam
n installe ni paquet Python ni poids de modele pendant l execution.
