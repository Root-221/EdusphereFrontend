# Roadmap admin ecole

Base sur les pages actuelles du dossier `school-admin`. Les specs ci-dessous decrivent le comportement cible, meme si certains ecrans utilisent encore des donnees mock.

## Vue d'ensemble

| Phase | Objectif | Contenu |
| --- | --- | --- |
| MVP | Mettre en place le socle operationnel de l ecole | Dashboard, structure academique, personnes, inscriptions, pedagogie quotidienne |
| V1 | Ouvrir la gestion aux familles et a l administration interne | Parents, infrastructure, personnel administratif, rapports, parametres de base |
| V2 | Ajouter la couche financiere et l optimisation | Frais, paiements, suivi financier et automatisations |

## Regles communes

- Acces reserve au role `school_admin`.
- Toutes les donnees sont scopees au tenant de l ecole.
- Les formulaires bloquent l enregistrement si les champs obligatoires sont incomplets.
- Apres une action reussie, la vue concernnee doit se mettre a jour sans rechargement manuel.
- Les listes doivent gerer les etats vides, de chargement et d erreur avec un message clair.

## MVP

### Dashboard

Contenu couvre: tableau de bord ecole.

User story:
- En tant qu admin ecole, je veux voir les indicateurs essentiels au premier ecran afin de piloter l activite sans naviguer partout.

Criteres d'acceptation:
- Afficher les KPI principaux: eleves, enseignants, classes et moyenne generale.
- Afficher des graphiques et les activites recentes.
- Donner acces rapide aux actions les plus frequentes.

### Annees scolaires

Contenu couvre: annees scolaires.

User story:
- En tant qu admin ecole, je veux creer et gerer les annees scolaires afin d organiser la progression academique de l etablissement.

Criteres d'acceptation:
- Permettre la creation, modification et suppression d une annee scolaire.
- Permettre l activation et la desactivation d une annee.
- Afficher le statut, les dates de debut et de fin, et les filtres par statut.

### Semestres

Contenu couvre: semestres.

User story:
- En tant qu admin ecole, je veux structurer une annee en semestres pour pouvoir organiser les cours, evaluations et bulletins.

Criteres d'acceptation:
- Rattacher chaque semestre a une annee scolaire.
- Permettre la creation, modification, suppression et le verrouillage ou deverrouillage.
- Filtrer les semestres par annee et par statut.

### Classes

Contenu couvre: classes.

User story:
- En tant qu admin ecole, je veux gerer les classes pour y affecter les eleves, les enseignants et les matieres.

Criteres d'acceptation:
- Permettre de definir le niveau, la capacite et le professeur principal.
- Permettre d affecter des matieres a la classe.
- Afficher le nombre d eleves, le detail de la classe et les actions de gestion.

### Matieres

Contenu couvre: matieres.

User story:
- En tant qu admin ecole, je veux gerer le catalogue des matieres et leurs enseignants afin de structurer l enseignement.

Criteres d'acceptation:
- Permettre la creation, modification et suppression d une matiere.
- Permettre l assignation d un ou plusieurs enseignants a la matiere.
- Afficher les informations utiles comme le code, le volume horaire et le coefficient.

### Enseignants

Contenu couvre: enseignants.

User story:
- En tant qu admin ecole, je veux gerer les fiches des enseignants pour suivre leurs contacts, leur statut et leur matiere.

Criteres d'acceptation:
- Permettre la creation, modification et suppression d un enseignant.
- Permettre le filtrage par statut et par matiere.
- Afficher les coordonnees, la matiere principale et le statut actif ou inactif.

### Eleves

Contenu couvre: eleves.

User story:
- En tant qu admin ecole, je veux gerer les dossiers eleves afin de les affecter a une classe et de suivre leur situation.

Criteres d'acceptation:
- Permettre la creation, modification et suppression d un eleve.
- Permettre la recherche, les filtres par classe et statut, ainsi que le mode grille ou liste.
- Afficher la fiche eleve, les informations parentales et une carte eleve telechargeable.

### Inscriptions et reinscriptions

Contenu couvre: inscriptions et reinscriptions.

User story:
- En tant qu admin ecole, je veux inscrire ou reinscrire un eleve via un parcours guide afin de limiter les erreurs et de suivre le paiement.

Criteres d'acceptation:
- Proposer un assistant en plusieurs etapes: administratif, pedagogique, paiement.
- Permettre la gestion des periodes d inscription avec creation, edition, activation et suppression.
- Suivre le statut de l inscription et le mode de paiement associe.

### Emplois du temps

Contenu couvre: emplois du temps.

User story:
- En tant qu admin ecole, je veux construire et dupliquer les emplois du temps afin d organiser les cours par classe.

Criteres d'acceptation:
- Creer un emploi du temps par classe, annee scolaire et semestre.
- Ajouter, modifier et supprimer des creneaux de cours.
- Permettre la duplication vers un autre semestre et l activation ou desactivation.

### Presences

Contenu couvre: presences.

User story:
- En tant qu admin ecole, je veux consulter les presences pour surveiller l assiduite des eleves et produire un suivi fiable.

Criteres d'acceptation:
- Filtrer les presences par date, classe, matiere et recherche textuelle.
- Afficher les statuts present, absent, retard et excuse avec des statistiques.
- Fournir un resume par classe et des actions d export ou de rapport.

### Evaluations

Contenu couvre: evaluations.

User story:
- En tant qu admin ecole, je veux creer et suivre les evaluations afin de piloter les devoirs, compositions et projets.

Criteres d'acceptation:
- Supporter plusieurs types: devoir, composition, essai, devoir maison, TP, projet et interrogation.
- Permettre les statuts brouillon, programmee, active, terminee et archivee.
- Filtrer par annee, semestre, classe, matiere, type et statut, puis afficher le detail complet.

### Bulletins

Contenu couvre: bulletins.

User story:
- En tant qu admin ecole, je veux generer et partager les bulletins afin de communiquer les resultats scolaires.

Criteres d'acceptation:
- Generer les bulletins par classe et par eleve.
- Permettre la consultation, le telechargement PDF et l impression.
- Conserver un historique des bulletins generes avec leur statut.

### Cahier de texte

Contenu couvre: cahier de texte.

User story:
- En tant qu admin ecole, je veux suivre les seances de cours afin de controler l avancement pedagogique des enseignants.

Criteres d'acceptation:
- Filtrer les seances par annee, enseignant, classe et statut.
- Grouper les seances par date et permettre la consultation detaillee.
- Afficher le contenu, les objectifs, les devoirs et le materiel associe.

## V1

### Parents

Contenu couvre: parents.

User story:
- En tant qu admin ecole, je veux gerer les comptes parents afin de relier chaque famille a ses enfants scolarises.

Criteres d'acceptation:
- Permettre la creation, modification et suppression d un parent.
- Permettre la recherche et les filtres par classe et statut.
- Afficher les coordonnees et le lien avec la classe de l enfant.

### Infrastructure

Contenu couvre: infrastructure.

User story:
- En tant qu admin ecole, je veux administrer les batiments et les salles afin de mieux organiser les espaces de l etablissement.

Criteres d'acceptation:
- Permettre la gestion des batiments et des salles avec creation, edition et suppression.
- Afficher une vue hierarchique batiment > salle.
- Gerer les types de salles, la capacite, le statut et les filtres de visualisation.

### Personnel administratif

Contenu couvre: personnel administratif.

User story:
- En tant qu admin ecole, je veux gerer le personnel administratif afin de suivre les fonctions internes de l ecole.

Criteres d'acceptation:
- Permettre la creation, modification et suppression d un membre.
- Permettre l activation ou desactivation d un compte personnel.
- Filtrer par fonction, departement et statut, avec affichage de la date d embauche.

### Rapports

Contenu couvre: rapports.

User story:
- En tant qu admin ecole, je veux generer des rapports afin de suivre les performances et l activite de l etablissement.

Criteres d'acceptation:
- Permettre la creation de rapports academiques, statistiques, presence et financiers.
- Afficher le statut de generation: en attente, en cours, termine.
- Permettre la consultation et le telechargement des rapports finis.

### Parametres ecole

Contenu couvre: parametres de base.

User story:
- En tant qu admin ecole, je veux configurer l identite et les regles de base de l ecole afin d adapter la plateforme a mon etablissement.

Criteres d'acceptation:
- Permettre la mise a jour du logo, du nom, de l email, du telephone et de l adresse.
- Permettre l activation ou desactivation des notifications importantes.
- Permettre le reglage des parametres academiques comme la note de passage et la generation automatique des bulletins.

## V2

### Gestion financiere

Contenu couvre: frais, paiements et suivi financier.

User story:
- En tant qu admin ecole, je veux suivre les frais et les paiements afin d avoir une vue claire sur la situation financiere de l etablissement.

Criteres d'acceptation:
- Permettre la creation et la gestion des frais scolaires par categorie.
- Permettre l enregistrement et la confirmation des paiements avec date et mode de paiement.
- Afficher les totaux encaisses, en attente et le taux de paiement.

### Optimisation et automatisation

Contenu couvre: evolutions futures autour du reporting, des exports et des alertes.

User story:
- En tant qu admin ecole, je veux automatiser les taches repetitives afin de gagner du temps et de reduire les erreurs manuelles.

Criteres d'acceptation:
- Ajouter des exports plus riches sur les modules cles.
- Ajouter des alertes et rappels automatiques selon les evenements metier.
- Consolider les statistiques pour aider a la prise de decision.
