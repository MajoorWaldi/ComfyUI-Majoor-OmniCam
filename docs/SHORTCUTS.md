# OmniCam keyboard shortcuts and controls

Les raccourcis sont actifs uniquement lorsque le viewport ou la timeline
OmniCam a le focus. Ils ne capturent jamais le clavier pendant la saisie dans
un champ.

## Navigation du viewport

Le profil se choisit dans **Transform Tools > Navigation** :

- **Maya** : `Alt/Option` + bouton gauche / milieu / droit pour orbit / pan / dolly.
- **Blender** : bouton milieu pour orbit, `Shift` + milieu pour pan,
  `Ctrl/Cmd` + milieu pour dolly. Un glisser gauche dans le vide crée une
  sélection rectangulaire.

| Contrôle | Action |
|---|---|
| Molette | Dolly avant/arrière |
| Double-clic | Placer la cible de caméra |
| `W`, `A`, `S`, `D`, `Q`, `E` en Fly | Déplacement libre |
| Molette en Fly | Régler la vitesse Fly |
| `F` ou `Numpad .` | Cadrer la sélection |
| `Numpad 0` | Vue de la caméra active |
| `Numpad 1` / `Ctrl/Cmd + Numpad 1` | Vue avant / arrière |
| `Numpad 3` / `Ctrl/Cmd + Numpad 3` | Vue droite / gauche |
| `Numpad 7` / `Ctrl/Cmd + Numpad 7` | Vue dessus / dessous |

## Sélection et transformation

| Raccourci | Action |
|---|---|
| Clic | Sélectionner un objet |
| `Shift/Ctrl/Cmd + clic` | Ajouter/retirer un objet de la sélection |
| `Ctrl/Cmd + glisser dans le vide` | Sélection rectangulaire avec le profil Maya |
| Glisser gauche dans le vide | Sélection rectangulaire avec le profil Blender |
| `Shift + G` | Sélectionner l'objet actif et tous ses descendants |
| `T` | Translation modale |
| `R` | Rotation modale |
| `S` | Mise à l'échelle modale |
| `X`, `Y`, `Z` pendant `T/R/S` | Contraindre ou libérer l'axe |
| Chiffres, `-`, `.` ou `,` | Saisir une valeur exacte |
| `Shift` pendant la transformation | Mouvement précis |
| `Enter` ou clic gauche | Confirmer |
| `Escape` ou clic droit | Annuler |
| Boutons ↔ / ⟳ / ⤢ | Choisir le gizmo translation / rotation / échelle |
| `Tab` | Basculer Object Mode / Component Mode |

`T/R/S` transforme tous les objets sélectionnés autour de leur pivot moyen.
Les objets verrouillés restent sélectionnables mais ne sont pas transformés.
`Q/W/E/A/S/D` ne pilotent la caméra que lorsque le mode Fly est actif ; hors
Fly, `Q`, `W` et `E` n'ont volontairement aucune commande d'outil concurrente.

Le menu **Spatial Snap** est indépendant du snapping temporel de la timeline :
**Grid** utilise le pas configuré, tandis que **Vertex** accroche le pivot de la
sélection à un sommet visible. `Ctrl/Cmd` active temporairement la grille. Pour
une sélection rectangulaire additive, maintenir `Shift` au démarrage.

## Animation et édition

| Raccourci | Action |
|---|---|
| `I` | Insérer/remplacer une clé à l'image courante |
| `Space` | Lecture/arrêt |
| Flèche gauche/droite | Image précédente/suivante |
| Flèche haut/bas | Clé précédente/suivante |
| `Home` / `End` | Première/dernière image |
| `[` / `]` | Définir le début/la fin de lecture |
| `Delete` / `Backspace` | Supprimer la clé ou l'objet sélectionné |
| `Ctrl/Cmd + C` / `Ctrl/Cmd + V` | Copier/coller une clé |
| `Ctrl/Cmd + D` | Dupliquer l'objet ou la caméra |
| `H` / `Alt/Option + H` | Masquer la sélection / tout afficher |
| `Ctrl/Cmd + Z` | Undo viewport |
| `Ctrl/Cmd + Shift + Z` | Redo viewport |
| `Ctrl/Cmd + Y` | Redo alternatif |

## Timeline et Curve Editor

| Contrôle | Action |
|---|---|
| Cliquer/glisser la timeline | Scrubber les images |
| Glisser une clé | Déplacer la clé dans le temps |
| `Shift + clic` | Ajouter une clé à la sélection |
| `Shift + glisser` dans le vide | Sélection rectangulaire de clés |
| `Alt/Option + glisser` une clé | Dupliquer et déplacer la clé |
| Molette | Zoom temporel |
| Bouton milieu ou `Alt/Option + glisser` | Pan |
| Glisser un point/une tangente | Modifier la valeur ou l'interpolation |

## Vérification manuelle du viewport

1. Créer trois objets au centre, en verrouiller un et effectuer une sélection multiple.
2. Tester `T X 2 Enter`, `R Z 45 Enter`, `S 1,5 Enter`, puis Undo/Redo.
3. Tester Grid et Vertex sans modifier le snapping de la timeline.
4. Tester la sélection rectangulaire additive et `Shift+G` sur une hiérarchie.
5. Basculer Maya/Blender et vérifier orbit, pan et dolly dans chaque profil.
