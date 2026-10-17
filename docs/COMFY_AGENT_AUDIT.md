# Audit de preparation a Comfy Agent

Date : 2026-10-16. Cible : panneau officiel **Comfy Agent** de la capture.

## Suivi des corrections (2026-10-16)

Les constats historiques ci-dessous sont conserves pour tracabilite. Les
corrections ont ete implementees apres cet audit :

| Constat | Resolution |
|---|---|
| A1 | Contrat `/agent/v1/contract`, statut natif explicite, client local d'exemple et recette d'acceptation pour le futur adapter |
| A2 | Identite document/graphe/locator/instance, racine du noeud proprietaire, isolation des sessions et rotation sur reconfiguration |
| A3 | Invalidation synchrone des revisions sur restauration, remplacement, historique headless et configure avant le RAF |
| A4 | Deadline avant commit, journal borne, resultat tardif recuperable, retries idempotents et rejet d'un id reutilise avec un autre contenu |
| A5 | Revision des observations conservee ; changement concurrent refuse avec STALE_PLAN |
| A6 | Catalogue annonce, test de parite Python/JS ; restriction camera.path du planner documentee |
| A7 | Endpoints natifs HTTPS fixes, refus avant connexion de toute origine/base path differente |

Verification sur ComfyUI **0.41.2**, frontend **1.55.17**, Python ComfyUI
**3.13.12**. La suite Python complete passe : **2016 reussis, 18 ignores**.
Le Python systeme 3.14 rencontre toujours une dependance hote absente ; les
dependances de production n'ont pas ete installees/modifiees pour le contourner.
Pytest deja present a ete charge dans le Python ComfyUI pour la verification.
Six assertions de tests qui ne refletaient plus les contrats courants ont ete
actualisees (retiming, erreur de validation, options Monitor et profils H3/Seedance).

Frontend : **1470 tests unitaires**, **185 tests navigateur**, **15 tests live**
(classiques, Vue et agent) valides sur les bundles finaux. Le nouveau test live verifie le vrai chemin
HTTP -> WebSocket -> Director -> reponse, Preview/Apply, retry sans double
application, recuperation du resultat et serialisation du widget.
Une course de demarrage dans les tests a ete corrigee : chargement asynchrone
du workflow via ComfyUI au lieu d'un simple graph.clear avant creation du noeud.
Les suites live s'executent sequentiellement : elles partagent les reglages
utilisateur et la queue du serveur ; une bascule Vue ne doit pas interrompre
le montage d'un autre test. Le test agent est inclus dans les lanes CI frontend.
Les suites live tournent sur un serveur CPU distinct (8191), sans arreter
l'instance utilisateur (8188). Lint, controles statiques et packaging valides.

L'enregistrement d'outils dans le panneau officiel reste une **future
integration**, conditionnee a son API officielle/version et a une conversation
reelle de validation. Aucun support natif non verifie n'est annonce ; aucun
store interne Comfy Agent n'est importe. Les tests de viewport existants
completent cette verification, sans constituer une certification manuelle GPU.

## Rapport initial

Verdict : **integration native non demontree ; transport OmniCam utilisable mais a durcir**.
Evaluation indicative : 60/100, beta interne. Ce score concerne l'integration
agent, pas la qualite globale du produit.

## Portee et methode

Revue transversale des points d'entree Python/V3, extension frontend,
runtime Director, API semantique, broker, planner, providers, stockage des
secrets, contrats/migrations, routes de fichiers, exemples et CI.
Lecture approfondie des modules aux frontieres agent ; execution des controles
statiques et suites disponibles. Ceci n'est pas une certification de chaque
ligne des 978 fichiers controles, ni une validation GPU ou du service Comfy Agent.
Les modifications deja presentes dans le checkout ont ete conservees.
Aucun correctif fonctionnel n'a ete applique pendant cet audit.

Sources officielles consultees avant redaction :

- [Frontend : panneau officiel](https://github.com/Comfy-Org/ComfyUI_frontend/blob/main/src/extensions/core/agentPanel.ts)
- [Frontend : extensions](https://github.com/Comfy-Org/ComfyUI_frontend/blob/main/docs/extensions/core.md)
- [Core : API V3](https://github.com/Comfy-Org/ComfyUI/blob/master/comfy_api/latest/_io.py)
- [Communication serveur](https://docs.comfy.org/development/comfyui-server/comms_overview)
- [Comfy MCP local](https://github.com/Comfy-Org/comfy-mcp)
- [CLI : contrats workflow et graphe vivant](https://github.com/Comfy-Org/comfy-cli/blob/main/comfy_cli/skills/comfy/SKILL.md)

Ces sources suivent les branches publiques, pas necessairement la version
installee chez l'utilisateur. La capture seule ne fournit aucun numero de version.

## Constats prioritaires

### A1 - P1 : aucun raccordement etabli au panneau officiel

Preuves : `web-src/main.js`, `web-src/agent/protocol.js`,
`omnicam/agent/routes.py`, `docs/AGENT_INTEGRATION.md`.
L'extension enregistre ses noeuds et son propre protocole HTTP/WS. Le panneau
AGENT OmniCam appelle ses propres providers. Le depot ne montre pas de liaison
entre ces routes et les outils du panneau officiel. La compatibilite avec un
client MCP externe ne prouve pas cette liaison.

Consequence : un agent pouvant editer un workflow peut potentiellement manipuler
les widgets standard, mais rien ne prouve qu'il sache appeler les transactions
semantiques OmniCam. `state_json` est une chaine opaque dans le schema du Director,
sans description du contrat par champ. Il ne faut pas annoncer une integration
native sur la seule base de `/object_info` ou des tests du panneau OmniCam.

Action : relever les versions installees, verifier les outils effectivement
exposes par Comfy Agent et leur mecanisme d'extension ; choisir ensuite le
raccordement supporte. Ne pas importer les stores internes Pinia du frontend.
Fournir des exemples agent lisibles et un contrat semantique machine-readable.

### A2 - P1 : identite de session sans workflow ni chemin de sous-graphe

Preuves : `omnicam/agent/broker.py:114`, `web-src/agent/bridge.js:199`.
Une session est remplacee par le couple `(client_id, node_id)`. Ni l'enregistrement,
ni la liste des sessions, ni les messages ne portent d'identifiant de workflow
ou de locator complet. Deux workflows peuvent reutiliser le meme identifiant
numerique ; ce contrat ne permet pas de distinguer leurs Director.

Impact : une integration qui choisit un Director par son seul node_id ne peut
pas garantir qu'il appartient au workflow cible de la conversation. La collision
exacte en navigation multi-onglets depend du cycle de vie du frontend installe
et reste a reproduire en live.

Action : ajouter workflow identity, graph/subgraph locator et instance id ;
invalider les plans au changement de document et tester deux workflows ayant
le meme node_id, les sous-graphes, fermeture/reouverture et reconnexion WS.

### A3 - P1 : restauration headless sans invalidation de revision

Preuve : `web-src/director/runtime.js:164`.
`restoreFromWidgetsHeadless()` remplace `state` et emet `upstreamchange`, sans
incrementer `directorRevision`. Le hook `node.onConfigure` du shell appelle
ce chemin lorsque le workbench est ferme. La restauration d'historique headless
remplace egalement l'etat sans increment direct de revision.

Reproduction cible : lire une revision R, restaurer un document different sur
le meme runtime ferme, soumettre une transaction avec baseRevision R.
Le garde de `transaction.js` compare seulement les compteurs ; ce remplacement
ne suffit donc pas a rendre le jeton precedent obsolete.

Action : versionner chaque remplacement canonique immediatement, avant les
notifications ; ajouter un identifiant d'epoque de document et un test de plan
Preview -> reconfigure -> Apply refuse. Verifier aussi le chemin workbench ouvert.

### A4 - P1 : timeout HTTP avec resultat de mutation indetermine

Preuves : `omnicam/agent/broker.py:196`, `web-src/agent/bridge.js:290` et `:298`.
Le broker abandonne apres huit secondes. Le navigateur ne recoit ni deadline
ni annulation et peut attendre le catalogue avant execute, ou la reconciliation
des ressources apres commit. Une mutation peut donc etre appliquee apres le
timeout, ou deja commise quand le client recoit l'erreur.

Impact : un retry avec un nouvel id peut doubler une intention. Le cache des
ids protege certains replays, mais ne fournit pas le resultat durable d'une
requete dont l'accuse a ete perdu.

Action : deadline verifiee juste avant commit, identifiant idempotent stable,
statut consultable apres timeout ; distinguer commit et chargement des ressources.
Tester un catalogue/reconcile de plus de huit secondes sans modeles de diffusion.

### A5 - P2 : le planner adopte une revision plus recente que ses observations

Preuve : `omnicam/agent/planner.py:104`.
Le modele observe une scene, puis le serveur lit la revision courante juste
avant de previsualiser la proposition. Si l'utilisateur a modifie la scene
pendant la generation, la proposition est rebasee implicitement sur cette
nouvelle revision. Le garde Preview -> Apply reste utile et fonctionne, mais
ne protege pas la coherence entre observations et proposition initiale.

Action : conserver la revision des observations, refuser/replanifier si elle
change. Ne pas remplacer silencieusement cette revision par health.get courant.

### A6 - P2 : decouverte incomplete du catalogue agent

Preuves : `web-src/agent/bridge.js:39` et `:205`.
Le bridge implemente `asset.catalog_search` mais n'annonce que
`DIRECTOR_QUERY_VALUES`, qui n'inclut pas cette requete. Le planner interne
la connait par une liste Python distincte ; un client externe faisant confiance
aux capacites annoncees ne la decouvrira pas.

Action : annoncer les requetes du bridge et verifier automatiquement la parite
du contrat Python/JS. Les operations camera.path existent egalement cote JS
mais sont absentes du vocabulaire du planner : documenter cette restriction
ou l'etendre explicitement.

### A7 - P2 : secret fournisseur non lie a une origine

Preuves : `omnicam/agent/provider_routes.py:95`, `:115`, `:138`,
`omnicam/agent/providers/openai.py:46`, `anthropic.py:36`.
Une base_url fournie dans la requete est combinee avec le secret conserve pour
le provider. Les endpoints custom loopback sont autorises par defaut ; les
endpoints distants le sont apres opt-in operateur. La cle native peut donc etre
envoyee a une origine differente, y compris en HTTP. Le filtre SSRF ne constitue
pas une liaison du secret a son origine.

Precondition : controle d'une requete de configuration/test/planning pour
l'utilisateur concerne ; aucune fuite distante sans cette precondition n'est
demontree. Aucune cle reelle n'a ete lue ou envoyee pendant l'audit.

Action : fixer les origines des providers natifs ou lier chaque credential a
une origine explicitement approuvee ; credentials distincts pour proxies custom.
Tester avec un faux secret et un serveur factice.

## Architecture a conserver

- Trois noeuds publics V3, registre dedie et MotionScene comme contrat produit.
- Profils Monitor pour les semantiques modeles ; pas de SDK LLM dans le coeur.
- Transactions sur draft, validation avant swap, verrouillage, undo et
  protection baseRevision pour les mutations correctement versionnees.
- Preview/Apply du planner, TTL des plans et rejet d'un diff tronque.
- Requetes bornees, tokens ephemeres, limites sessions/requetes ; routes externes
  loopback avec en-tete explicite. Ce dernier est un marqueur, pas un secret.
- Routes de fichiers avec racines gerees et validation ; politique reseau des
  providers avec refus des redirections, bornes et filtrage DNS.
- Registre de migrations explicite ; aucun changement de schema requis pour
  ajouter une identite de transport agent.

## Verification executee

| Controle | Resultat |
|---|---|
| `npm run check` | Reussi : taille, encodage, Three, locales, templates, licences, syntaxe |
| `npm run test:unit` | 1 463 reussis |
| `pytest tests/agent` avec basetemp neuf et cache desactive | 170 reussis |
| Selection coeur/noeuds/routes/contrats, 11 modules | 192 reussis, 5 ignores |
| Suite Python generale, arret au premier echec avec basetemp neuf | 665 reussis, 20 ignores ; echec import `comfy_aimdo.storage` dans le ComfyUI hote |
| `npm run test:browser` | Bloque avant les tests : esbuild ne peut lire un repertoire parent |
| Panneau officiel, live-ci, live-vue-ci, GPU, QA viewport | Non valides pendant cette revue |

Les premieres executions Python ont aussi rencontre des refus d'acces aux
repertoires temporaires ; les resultats chiffres ci-dessus utilisent des
repertoires neufs accessibles. Les suites agent navigateur montent des stubs
du broker : elles ne prouvent pas une conversation avec Comfy Agent officiel.
Les fichiers CI prevoient des lanes live classiques/Vue et plusieurs versions,
mais leur dernier statut distant n'a pas ete consulte. Aucun resultat CI distant
n'est suppose vert.

## Ordre de travail propose

1. Verifier le raccordement officiel et figer une matrice de versions cible.
2. Corriger identite workflow/document et invalidation des revisions.
3. Garantir statut de commit/idempotence sur timeout et reconnexion.
4. Lier credentials/origines ; aligner decouverte et schemas semantiques.
5. Tester la conversation reelle : creer Director/Monitor, mentionner le bon
   noeud, editer camera/objets, Preview/Apply, changement concurrent, sauvegarde
   et rechargement, preflight Monitor, puis execution explicitement autorisee.
6. Rendre cette recette bloquante pour les versions annoncees compatibles.

L'acceptation exige notamment deux workflows aux IDs reutilises, workflow non
enregistre, sous-graphe, changement d'onglet pendant une requete, frontend Vue,
timeout apres commit et conservation du MotionScene apres sauvegarde/rechargement.
Le transport doit rester hors du MotionScene ; aucun quatrieme noeud public
ni dependance modele supplementaire n'est necessaire pour ces corrections.
