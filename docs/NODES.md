# Guide des nœuds Majoor OmniCam

Ce document décrit les 15 nœuds fournis par Majoor OmniCam 0.3.0, leur fonctionnement et les cas dans lesquels ils sont utiles.

## Types OmniCam

| Type | Contenu | Utilité |
|---|---|---|
| `MAJOOR_OMNICAM_TRACK` | Trajectoire caméra canonique : FPS, durée, résolution, keyframes, position, cible, FOV, roll et proxies. | Source de vérité commune à tous les adaptateurs. |
| `MAJOOR_OMNICAM_ATI_BRIDGE` | Points 3D projetés sous forme de trajectoires 2D image par image. | Représentation générique pour ATI et les intégrations à base de trajectoires. |
| `MAJOOR_OMNICAM_LTX_BRIDGE` | Intrinsèques et extrinsèques caméra par image. | Représentation LTX neutre, indépendante d'une version particulière de nœud tiers. |
| `MAJOOR_OMNICAM_SEQUENCE` | Liste ordonnée de plans OmniCam avec noms, handles, références et réglages d'adaptateurs. | Construction d'une séquence multi-plans. |

Les sorties JSON accompagnant ces types servent surtout au diagnostic, à l'archivage ou à une intégration externe. Dans un workflow ComfyUI normal, préférez toujours les connexions typées.

## Vue d'ensemble

| Nœud | Catégorie | Rôle principal |
|---|---|---|
| Majoor OmniCam Director | `Majoor/OmniCam` | Créer visuellement une caméra, une scène proxy et un playblast. |
| OmniCam Track Sampler | `Utilities` | Lire l'état de la caméra à une image précise. |
| OmniCam → MiniMax H3 Omni Reference | `Adapters` | Préparer la vidéo et le prompt de mouvement pour H3. |
| OmniCam → Wan ATI Bridge | `Adapters` | Générer des trajectoires ATI génériques. |
| OmniCam → Wan Native Camera | `Adapters` | Produire le conditionnement caméra Plücker natif de Wan. |
| OmniCam → WanVideoWrapper ATI | `Adapters` | Produire la chaîne `tracks` exacte du WanVideoWrapper épinglé. |
| OmniCam ATI Trajectory Preview | `Adapters` | Visualiser les trajectoires ATI sur une image. |
| OmniCam → LTX Camera Bridge | `Adapters` | Exporter un payload caméra LTX neutre. |
| OmniCam → LTX Camera Guide | `Adapters` | Convertir le playblast en frames de guide IC-LoRA. |
| OmniCam Camera Tools | `Utilities` | Appliquer mouvements, contraintes et lissage à une piste. |
| OmniCam Sequence Builder | `Sequence` | Assembler jusqu'à 32 plans. |
| OmniCam Sequence Shot | `Sequence` | Extraire un plan d'une séquence. |
| OmniCam Sequence Playblast Manifest | `Sequence` | Générer le manifeste des playblasts d'une séquence. |
| OmniCam → Blender Export | `Export` | Écrire un script caméra Blender et son JSON. |
| OmniCam → Unreal Export | `Export` | Écrire un script CineCamera/Sequencer Unreal et son JSON. |

## 1. Majoor OmniCam Director

Identifiant interne : `MajoorOmniCamDirector`.

Le Director est le nœud principal. Il fonctionne comme un petit outil de layout caméra directement dans ComfyUI, sans lancer de modèle de diffusion.

### Entrées

| Entrée | Description |
|---|---|
| `width`, `height` | Résolution du plan et du playblast. |
| `fps` | Fréquence de la timeline, de 1 à 120 images/s. |
| `duration_seconds` | Durée du plan. |
| `render_mode` | Proxy `omni_ref`, `graybox`, `grid`, `point_field`, `wireframe` ou `card_grid`. |
| `image` | IMAGE optionnelle, y compris un batch. Jusqu'à 32 références sont proposées dans le sélecteur après exécution. |
| `video` | VIDEO optionnelle utilisée comme référence amont. |
| `state_json` | État sérialisé du Director. Champ avancé géré automatiquement par l'interface. |
| `recording_path` | Chemin ComfyUI géré du playblast. Champ avancé automatique. |
| `card_asset` | Chemin ComfyUI géré de la carte principale. Champ avancé automatique. |

### Sorties

| Sortie | Description |
|---|---|
| `camera_track` | Piste caméra canonique à connecter aux adaptateurs et outils. |
| `proxy_video` | Playblast enregistré, sous forme de `VIDEO` ComfyUI. Peut être vide avant le premier playblast. |
| `camera_info` | État de la dernière image au format `LOAD3D_CAMERA`. |
| `track_json` | Copie JSON lisible de la piste. |
| `proxy_frames` | Frames décodées du playblast au format `IMAGE`. Peut être vide avant le premier playblast. |

### Fonctionnement

- navigation orbit, pan, dolly et WASD/QE ;
- timeline graduée avec tête de lecture et toutes les clés caméra visibles ;
- sélection, déplacement temporel, copie, collage et suppression des clés ;
- clé sélectionnée en jaune, rouge pendant une édition ponctuelle, puis bleue et désarmée à la fin de l'interaction ;
- mode Auto Key créant ou remplaçant la clé au frame courant, avec bordures d'état rouge/orange ;
- inspecteur de clé pour éditer image, interpolation, position, cible, FOV, roll, zoom et projection ;
- insertion avec `I`, lecture avec Espace, pas image avec Gauche/Droite, navigation entre clés avec `,`/`.` et cadrage avec `F` ;
- raccourcis limités au Director et désactivés pendant la saisie dans un champ ;
- menus compacts `Scene`, `Camera`, `Show` et `Output`, commandes de timeline en PrimeIcons et inspecteurs inférieurs repliables ;
- cartes image/vidéo, références multiples, primitives et scènes GLB/OBJ/FBX/STL/PLY gérées ;
- gizmos X/Y/Z Translate, Rotate et Scale en espace World ou Local ;
- HUD de scène dans le viewport avec sélection caméra/objets, champs transform et raccourcis `T`, `R`, `S` ;
- lecture des clips animés FBX/GLB synchronisée à la timeline et au playblast ;
- plusieurs caméras nommées, chacune avec ses propres clés et courbes ;
- sélection indépendante de la caméra éditée et de la caméra envoyée au playblast et aux sorties du nœud ;
- grand Editor View pour la scène et bande multiview compacte avec une preview par caméra ;
- réglages Camera `Near Clip` et `Far Clip` dans le HUD, animables et sérialisés dans la piste ;
- objet Ground sélectionnable et transformable, plus option indépendante `Playblast Grid` pour inclure la grille dans la capture ;
- pistes d'animation Position/Rotation/Scale par objet, éditables avec les clés, Auto Key et le Curve Editor ;
- sélection géométrique par raycast et manipulation T/R/S directement dans le viewport ;
- modes matériau Textures, Checker, Neutral et Wireframe pour chaque objet ;
- caméra de navigation Perspective indépendante, vues Top/Right/Left/Bottom et second viewport Camera affichable/masquable sans recouvrement ;
- Curve Editor Position/Target/Lens avec édition des valeurs et modes Linear, Smooth, Bezier, Ease In/Out ;
- durée et FPS synchronisant immédiatement timeline, règles, clés, scrubber et courbes ;
- encodage WebCodecs déterministe image par image, avec fallback temps réel ;
- playblast propre sans grille, guides caméra, trajectoire, gizmo ni speed map ;
- sérialisation du viewport, des objets et des keyframes dans le workflow ;
- compatibilité avec les nœuds ComfyUI classiques et Nodes 2.0.

### Quand l'utiliser

Utilisez toujours le Director au début d'un workflow OmniCam. C'est lui qui crée la piste commune réutilisée par H3, Wan, ATI, LTX, Blender, Unreal et le séquenceur.

## 2. OmniCam Track Sampler

Identifiant interne : `MajoorOmniCamTrackSampler`.

Échantillonne la piste à une image donnée, en appliquant l'interpolation entre les keyframes.

### Entrées et sorties

- Entrées : `camera_track`, `frame`.
- Sorties : `camera_info` au format `LOAD3D_CAMERA`, et `sample_json`.

### Utilité

Ce nœud est utile pour inspecter une caméra à l'image 0, à la dernière image ou à un point intermédiaire. Il permet aussi d'envoyer une caméra OmniCam vers un nœud compatible `LOAD3D_CAMERA` sans convertir toute la trajectoire.

## 3. OmniCam → MiniMax H3 Omni Reference

Identifiant interne : `MajoorOmniCamH3Adapter`.

Prépare la voie principale pour MiniMax H3 : une vidéo de référence caméra accompagnée d'un fragment de prompt qui demande de reproduire le mouvement sans copier l'apparence du proxy.

### Entrées

- `camera_track` : piste utilisée pour classifier le mouvement et annoncer sa durée.
- `proxy_video` : playblast optionnel venant du Director.
- `video_ref_token` : jeton H3, par défaut `<Video 1>`.

### Sorties

- `camera_reference_video` : la vidéo proxy transmise vers H3.
- `prompt_fragment` : texte décrivant trajectoire, cadrage, vitesse, accélération, parallaxe et timing.

### Utilité

Connectez `camera_reference_video` à une référence vidéo H3 et ajoutez `prompt_fragment` au prompt final. Le bouton **H3 Setup** du Director peut créer et relier cette partie lorsque le nœud H3 attendu est installé.

## 4. OmniCam → Wan ATI Bridge

Identifiant interne : `MajoorOmniCamWanATIAdapter`.

Projette un ensemble stable de points 3D dans la caméra à chaque image. Le déplacement apparent de ces points encode le mouvement, la perspective et la parallaxe.

### Entrées et sorties

- Entrées : `camera_track`, `point_count` de 4 à 128.
- Sorties : `ati_bridge` typé et `ati_json` lisible.

### Utilité

Ce pont est volontairement générique. Utilisez-le pour développer ou connecter une intégration ATI qui sait consommer les trajectoires canoniques OmniCam. Pour le WanVideoWrapper actuellement épinglé, utilisez plutôt le nœud suivant.

## 5. OmniCam → Wan Native Camera

Identifiant interne : `MajoorOmniCamWanNativeCamera`.

Convertit une piste OmniCam en embedding caméra Plücker natif de ComfyUI pour Wan.

### Entrées

| Entrée | Description |
|---|---|
| `camera_track` | Piste à convertir. |
| `width`, `height` | Résolution du workflow Wan. |
| `length` | Nombre d'images Wan. Cette valeur doit respecter `4n+1`, par exemple 81. |

### Sorties

- `camera_embedding` : type natif `WAN_CAMERA_EMBEDDING` ;
- `width`, `height`, `length` : valeurs retransmises pour garder le workflow cohérent.

### Utilité

C'est la voie recommandée lorsque le workflow Wan utilise le conditionnement caméra natif de ComfyUI. Reliez l'embedding au socket caméra correspondant de `WanCameraImageToVideo`.

## 6. OmniCam → WanVideoWrapper ATI

Identifiant interne : `MajoorOmniCamWanVideoWrapperATI`.

Convertit directement la piste OmniCam vers le champ texte `tracks` du nœud `WanVideoATITracks` de la version WanVideoWrapper épinglée dans la documentation de compatibilité.

### Entrées et sorties

- Entrées : `camera_track`, `point_count`.
- Sortie : `tracks`, chaîne JSON au format exact attendu, avec 121 échantillons par trajectoire.

### Utilité

Utilisez ce nœud pour le workflow WanVideoWrapper ATI pris en charge. Ne confondez pas sa sortie `STRING`, spécifique à cette version, avec le type générique `MAJOOR_OMNICAM_ATI_BRIDGE`.

## 7. OmniCam ATI Trajectory Preview

Identifiant interne : `MajoorOmniCamATIPreview`.

Dessine les points projetés ATI par-dessus la première image d'entrée.

### Entrées et sorties

- Entrées : `camera_track`, `image`, `point_count`.
- Sortie : `preview` de type IMAGE.

### Utilité

Placez ce nœud avant une génération ATI pour vérifier visuellement que les trajectoires restent dans l'image, suivent le sens attendu et fournissent une parallaxe lisible. Il s'agit d'un outil de diagnostic, pas d'un conditionnement modèle.

## 8. OmniCam → LTX Camera Bridge

Identifiant interne : `MajoorOmniCamLTXAdapter`.

Échantillonne la piste et produit un payload caméra LTX indépendant d'une version précise de custom node.

### Entrées et sorties

- `camera_track` : piste source.
- `length` : longueur cible optionnelle ; `0` conserve la durée de la piste.
- `ltx_camera_bridge` : données typées par image.
- `ltx_json` : position, cible, FOV, roll, type de caméra et temps en JSON.

### Utilité

Ce nœud sert d'interface stable pour une intégration LTX future ou personnalisée. Il ne prétend pas correspondre à un socket extrinsèque non documenté. Pour le chemin IC-LoRA actuellement pris en charge, utilisez `OmniCam → LTX Camera Guide`.

## 9. OmniCam → LTX Camera Guide

Identifiant interne : `MajoorOmniCamLTXCameraGuide`.

Décode le playblast `VIDEO` en frames `IMAGE` et analyse la piste pour recommander un profil de contrôle caméra LTX.

### Entrées et sorties

- Entrées : `camera_track`, `proxy_video`.
- `guide_frames` : frames à connecter à `LTXVAddVideoICLoRAGuide`.
- `camera_profile_json` : mouvement détecté, LoRA caméra recommandé et version d'intégration inspectée.

### Utilité

Utilisez ce nœud dans le workflow LTX IC-LoRA actuel. Le proxy transmet le mouvement visuel tandis que le JSON aide à choisir un profil statique, dolly, jib ou mouvement latéral.

## 10. OmniCam Camera Tools

Identifiant interne : `MajoorOmniCamCameraTools`.

Crée une nouvelle piste à partir d'une piste existante en appliquant un mouvement, une contrainte ou un traitement procédural.

### Entrées

- `camera_track` : piste source ;
- `operation` : opération à appliquer ;
- `amount` : intensité ou amplitude ;
- `seed` : graine du shake déterministe ;
- `target_x`, `target_y`, `target_z` : cible des contraintes avancées.

### Opérations disponibles

| Groupe | Opérations |
|---|---|
| Orbite | `orbit_left`, `orbit_right`, `product_360`, `auto_orbit` |
| Translation | `dolly_in/out`, `crane_up/down`, `truck_left/right`, `pedestal_up/down` |
| Orientation | `pan_left/right`, `tilt_up/down`, `look_at`, `follow_target` |
| Contraintes/optique | `arc_constraint`, `dolly_zoom`, `focal_length` |
| Traitement | `shake`, `smooth` |

### Sorties et utilité

Le nœud retourne une nouvelle `camera_track`, son `track_json` et un `motion_speed_json`. Il est utile pour créer rapidement une variante propre d'un plan, automatiser un mouvement ou analyser sa vitesse sans modifier la piste source.

## 11. OmniCam Sequence Builder

Identifiant interne : `MajoorOmniCamSequenceBuilder`.

Assemble de 1 à 32 pistes en une séquence ordonnée. Les entrées `shot1`, `shot2`, etc. grandissent automatiquement.

### Entrées

- `shots` : pistes dans l'ordre de montage ;
- `shot_names` : un nom par ligne ;
- `shot_settings_json` : liste JSON optionnelle de réglages par plan.

Exemple de réglages :

```json
[
  {
    "handle_in": 0,
    "handle_out": 8,
    "reference": "hero_card",
    "adapter_settings": {"h3_proxy_preset": "parallax"}
  }
]
```

Tous les plans doivent partager le même FPS. La sortie contient `sequence` et `sequence_json`.

### Utilité

Utilisez ce nœud pour organiser un découpage, conserver les handles de montage et associer à chaque plan une référence ou des réglages spécifiques à un adaptateur.

## 12. OmniCam Sequence Shot

Identifiant interne : `MajoorOmniCamSequenceShot`.

Extrait un plan précis d'une `MAJOOR_OMNICAM_SEQUENCE`.

- Entrées : `sequence`, `shot_index` de 0 à 31.
- Sorties : `camera_track`, `shot_name`.

Ce nœud permet d'envoyer un seul plan de la séquence vers H3, Wan, LTX ou un export DCC. Un index hors de la plage réelle est ramené au premier ou au dernier plan disponible.

## 13. OmniCam Sequence Playblast Manifest

Identifiant interne : `MajoorOmniCamSequenceManifest`.

Produit une liste JSON des plans avec leur nom, leurs images de début/fin et le chemin du playblast enregistré dans les métadonnées de chaque piste.

- Entrée : `sequence`.
- Sortie : `manifest_json`.

Ce manifeste est utile pour un pipeline externe, un contrôle de fichiers ou la préparation d'un futur export batch. Il n'enregistre pas lui-même les playblasts.

## 14. OmniCam → Blender Export

Identifiant interne : `MajoorOmniCamBlenderExport`.

Écrit deux fichiers sous le dossier de sortie ComfyUI : un script Python Blender et la piste JSON correspondante.

### Entrées et sorties

- `camera_track` : piste à exporter ;
- `filename_prefix` : préfixe sécurisé des fichiers ;
- `world_scale` : conversion entre les unités OmniCam et Blender ;
- `blender_script_path` et `track_json_path` : chemins générés.

### Utilité

Exécutez le script dans Blender pour reconstruire la caméra, le timing, le FOV/lens, le roll, l'interpolation et les proxies pris en charge. Le script contient aussi une fonction de réexport vers le JSON canonique après modification.

## 15. OmniCam → Unreal Export

Identifiant interne : `MajoorOmniCamUnrealExport`.

Écrit un script Python Unreal et la piste JSON dans le dossier de sortie ComfyUI.

### Entrées et sorties

- Entrées : `camera_track`, `filename_prefix`.
- Sorties : `unreal_script_path`, `track_json_path`.

### Utilité

Le script cible Unreal Engine 5.3 à 5.6 et reconstruit une CineCamera et une Level Sequence avec les clés de transform et de focale. Il fournit également une fonction de retour vers le JSON OmniCam. L'exécution doit être vérifiée dans la version exacte d'Unreal utilisée.

## Workflows recommandés

### MiniMax H3

```text
Majoor OmniCam Director
  ├─ camera_track ─┐
  └─ proxy_video ──┴─► OmniCam → MiniMax H3 Omni Reference
                         ├─ camera_reference_video → référence vidéo H3
                         └─ prompt_fragment → prompt H3
```

### Wan natif

```text
Director.camera_track
  → OmniCam → Wan Native Camera
  → WAN_CAMERA_EMBEDDING du workflow Wan
```

### WanVideoWrapper ATI

```text
Director.camera_track
  ├─► OmniCam ATI Trajectory Preview → contrôle visuel
  └─► OmniCam → WanVideoWrapper ATI.tracks → WanVideoATITracks
```

### LTX IC-LoRA

```text
Director.camera_track + Director.proxy_video
  → OmniCam → LTX Camera Guide
  → guide_frames vers LTXVAddVideoICLoRAGuide
```

### Séquence multi-plans

```text
Director A.camera_track ─┐
Director B.camera_track ─┼─► OmniCam Sequence Builder
Director C.camera_track ─┘          │
                                    ├─► Sequence Shot → adaptateur
                                    └─► Sequence Playblast Manifest
```

## Choix rapide

- Vous voulez créer ou modifier une caméra : **Director**.
- Vous voulez un mouvement automatique : **Camera Tools**.
- Vous utilisez H3 : **MiniMax H3 Omni Reference**.
- Vous utilisez le conditionnement Wan natif : **Wan Native Camera**.
- Vous utilisez le WanVideoWrapper ATI épinglé : **WanVideoWrapper ATI**.
- Vous développez un autre pont ATI : **Wan ATI Bridge**.
- Vous utilisez LTX IC-LoRA : **LTX Camera Guide**.
- Vous développez un contrôle LTX personnalisé : **LTX Camera Bridge**.
- Vous gérez plusieurs plans : **Sequence Builder**, puis **Sequence Shot**.
- Vous partez vers un DCC : **Blender Export** ou **Unreal Export**.
