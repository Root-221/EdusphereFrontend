# 📚 Liste des Modules EduSphere

D'après le document UML, voici tous les modules du système EduSphere:

---

## 🔐 MODULE 0: Authentification des Utilisateurs

| Fonctionnalité | Description |
|----------------|-------------|
| Connexion | Authentification des utilisateurs avec email/mot de passe |
| Déconnexion | Fermeture de session sécurisée |
| Réinitialisation du mot de passe | Processus de récupération de mot de passe |
| Gestion des rôles | Attribution et vérification des permissions par rôle |
| Authentification multi-facteurs | Sécurité renforcée (optionnel) |
| Sessions persistantes | Gestion des sessions utilisateur |

---

## 🔵 MODULE 1: Gestion des Écoles (Super Admin)

| Fonctionnalité | Description |
|----------------|-------------|
| Gestion du cycle de vie des écoles | Création, suspension, activation des écoles |
| Gestion des administrateurs d'écoles | Création, modification, attribution aux écoles |
| Surveillance des statistiques globales | Stats agrégées de toutes les écoles |
| Audit des logs système | Suivi des activités et événements système |
| Configuration des paramètres globaux | Politiques de sécurité et paramètres |

---

## 🟠 MODULE 2: Gestion Académique (School Admin)

### Année Scolaire
| Fonctionnalité | Description |
|----------------|-------------|
| Créer année scolaire | Définition des périodes académiques |
| Activer année scolaire | Définition de l'année active |
| Configurer paramètres | Dates de début/fin, statut |

### Semestres
| Fonctionnalité | Description |
|----------------|-------------|
| Créer semestre | Division de l'année scolaire |
| Mettre à jour le statut | Active, completed, locked |
| Dates de début/fin | Configuration des périodes |

### Classes
| Fonctionnalité | Description |
|----------------|-------------|
| Créer classe | Nom, niveau, capacité maximale |
| Modifier classe | Mise à jour des informations |
| Supprimer classe | Gestion des classes |
| Gérer les capacités | Contrôle des inscriptions |

### Matières
| Fonctionnalité | Description |
|----------------|-------------|
| Créer matière | Catalogue des matières |
| Définir coefficients | Pondération des notes |
| Gérer par école | Attribution aux établissements |

### Emplois du Temps
| Fonctionnalité | Description |
|----------------|-------------|
| Créer EDT | Planning hebdomadaire par classe |
| Planifier les créneaux | Attribution des horaires |
| Gérer les entrées | Modification des cours |

### Inscriptions/Réinscriptions
| Fonctionnalité | Description |
|----------------|-------------|
| Créer inscription | Processus d'inscription administrative |
| Gérer réinscriptions | Annuelles |
| Confirmer inscription | Workflow de validation |
| Processus de paiement | Intégration paiement |

---

## 🟡 MODULE 3: Gestion Pédagogique

### Devoirs (Assignments)
| Fonctionnalité | Description |
|----------------|-------------|
| Créer devoir | Titre, description, classe, matière |
| Modifier devoir | Mise à jour |
| Supprimer devoir | Suppression |
| Date limite | Due date |
| Statut | Draft, published, closed |

### Examens/Compositions
| Fonctionnalité | Description |
|----------------|-------------|
| Planifier examen | Date, durée, salle |
| Créer composition | Titre, classe, matière |
| Surveillance | Gestion des surveillants |
| Statut | Scheduled, completed, cancelled |

### Notes (Grades)
| Fonctionnalité | Description |
|----------------|-------------|
| Saisir notes | Enregistrement des évaluations |
| Mettre à jour | Modification des notes |
| Calculer moyennes | Par matière, par semestre |
| Publier résultats | Mise en ligne |

### Bulletins
| Fonctionnalité | Description |
|----------------|-------------|
| Générer bulletin | Document récapitulatif |
| Valider bulletin | Processus de validation |
| Classement | Rang de l'élève |
| Exporter PDF | Format imprimable |

### Cahier de Texte (Lesson Logs)
| Fonctionnalité | Description |
|----------------|-------------|
| Rédiger cours | Titre, objectifs, contenu |
| Publier cours | Mise en ligne |
| Gérer les objectifs | Liste des compétences |
| Ajouter devoirs | Intégration homework |

### Présences
| Fonctionnalité | Description |
|----------------|-------------|
| Saisir présence | Present, absent, late, excused |
| Suivi quotidien | Par classe, par date |
| Statistiques | Taux de présence |
| Gestion des retards | Temps de retard |

---

## 🟢 MODULE 4: Gestion des Utilisateurs

### Enseignants
| Fonctionnalité | Description |
|----------------|-------------|
| Ajouter enseignant | Création de compte |
| Modifier enseignant | Mise à jour profil |
| Attribuer aux classes | Affectation |
| Attribuer matières | Enseignements |

### Élèves
| Fonctionnalité | Description |
|----------------|-------------|
| Ajouter élève | Création de compte |
| Modifier élève | Mise à jour informations |
| Radiation | Suppression |
| Affectation de classe | Inscription effective |

### Parents
| Fonctionnalité | Description |
|----------------|-------------|
| Créer compte parent | Association à l'élève |
| Lier aux enfants | Relation parent-élève |
| Gérer tuteur légal | isGuardian |

### Personnel Administratif
| Fonctionnalité | Description |
|----------------|-------------|
| Gérer le personnel | Staff management |
| Attributions | Rôles et permissions |

---

## 🔴 MODULE 5: Communication

### Notifications
| Fonctionnalité | Description |
|----------------|-------------|
| Consulter notifications | Liste des alertes |
| Notifications système | Automatisées |
| Alertes | Warnings, erreurs |

### Messagerie
| Fonctionnalité | Description |
|----------------|-------------|
| Envoyer messages | Communication interne |
| Conversations | Historique des échanges |
| Par acteur | Teacher-Student, Teacher-Parent |

---

## 🟣 MODULE 6: Gestion Financière

### Paiements
| Fonctionnalité | Description |
|----------------|-------------|
| Enregistrer paiement | Espèces, Wave, Orange Money |
| Suivre les encaissements | Historique |
| Statut du paiement | Completed, pending, failed |
| Transaction ID | Identification unique |

### Frais de Scolarité
| Fonctionnalité | Description |
|----------------|-------------|
| Définir les frais | Tarifs par classe |
| Catégories | Frais obligatoires, optionnels |
| Calcul automatique | Selon inscription |

### Relances
| Fonctionnalité | Description |
|----------------|-------------|
| Suivi des retards | Gestion des impayés |
| Notifications | Rappels de paiement |
| Statistiques | Créances en cours |

### Rapports Financiers
| Fonctionnalité | Description |
|----------------|-------------|
| Bilans | États des recettes/dépenses |
| Export PDF/Excel | Formats disponibles |
| Par période | Annuel, semestriel |

---

## ⚪ MODULE 7: Tableaux de Bord (Dashboards)

### Dashboard Super Admin
| Fonctionnalité | Description |
|----------------|-------------|
| Stats globales | Agrégées de toutes les écoles |
| Gestion écoles | Vue d'ensemble |
| Rapports globaux | Synthèse |

### Dashboard School Admin
| Fonctionnalité | Description |
|----------------|-------------|
| Vue école | École active |
| Stats académiques | Élèves, enseignants |
| Gestion rapide | Accès direct |

### Dashboard Enseignant
| Fonctionnalité | Description |
|----------------|-------------|
| Mes classes | Classes attribuées |
| Mon planning | Emploi du temps |
| Stats performances | Classes |

### Dashboard Élève
| Fonctionnalité | Description |
|----------------|-------------|
| Mes devoirs | À faire |
| Mes notes | Historique |
| Mon EDT | Planning hebdomadaire |

### Dashboard Parent
| Fonctionnalité | Description |
|----------------|-------------|
| Mes enfants | Liste des enfants |
| Suivi académique | Notes, présences |
| Paiements | Frais de scolarité |

### Dashboard Comptable
| Fonctionnalité | Description |
|----------------|-------------|
| Vue financière | Encaissements |
| Stats paiements | Jour, mois, année |
| Rapports | Financiers |

---

## 🟤 MODULE 8: Gestion des Profils

| Fonctionnalité | Description |
|----------------|-------------|
| Mise à jour profil | Informations personnelles |
| Avatar | Photo de profil |
| Paramètres | Configuration compte |
| Mot de passe | Changement |

---

## ⚫ MODULE 9: Rapports & Exports

### Rapports Académiques
| Fonctionnalité | Description |
|----------------|-------------|
| Génération | Automatique |
| Export PDF | Format imprimable |
| Export Excel | Tableur |

### Rapports Financiers
| Fonctionnalité | Description |
|----------------|-------------|
| Bilans | Recettes/dépenses |
| États | Par période |
| Statistiques | Analyses |

### Statistiques
| Fonctionnalité | Description |
|----------------|-------------|
| Consultations | Graphiques |
| Exports | Multi-format |

---

## 📋 Annexe: Entités/Types de Données

| Entité | Description |
|--------|-------------|
| School | Établissement/École |
| AcademicYear | Année Scolaire |
| Semester | Semestre |
| Class | Classe |
| Subject | Matière |
| User | Utilisateur (base) |
| Teacher | Enseignant |
| Student | Élève |
| Parent | Parent/Tuteur |
| SchoolAdmin | Administrateur école |
| Accountant | Comptable |
| Enrollment | Inscription |
| Payment | Paiement |
| Timetable | Emploi du Temps |
| TimeSlot | Créneau Horaire |
| Assignment | Devoir |
| Exam | Examen |
| Grade | Note |
| Bulletin | Bulletin |
| LessonLog | Cahier de Texte |
| Attendance | Présence |
| EnrollmentPeriod | Période d'Inscription |
| EnrollmentFee | Frais de Scolarité |

---

## 👥 Rôles d'Utilisateurs

| Rôle | Description |
|-------|-------------|
| Super Admin | Administrateur plateforme centrale |
| School Admin | Administrateur d'établissement |
| Teacher | Enseignant/Corps professoral |
| Student | Apprenant inscrit |
| Parent | Tuteur légal d'élève |
| Accountant | Responsable financier |

---

## ✅ Matrice des Permissions (Résumé)

| Fonctionnalité | Super Admin | School Admin | Teacher | Student | Parent | Accountant |
|----------------|:-----------:|:------------:|:-------:|:-------:|:------:|:----------:|
| Créer école | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Gérer année/semestre | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Gérer classes/matières | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Consulter EDT | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Gérer inscriptions | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Enregistrer paiements | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Saisir présences | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Saisir notes | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Consulter notes | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Gérer bulletins | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Rédiger cahier de texte | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |

---

*Document généré à partir de l'analyse du code source frontend d'EduSphere*
*Date : 2025*
*Version : 1.0*

