# EduSphere Central - Plateforme de Gestion Scolaire

<div align="center">

![EduSphere Logo](https://via.placeholder.com/150x50/1A408C/FFFFFF?text=EduSphere)

**Une plateforme complète de gestion scolaire pour les établissements d'enseignement**

[![React](https://img.shields.io/badge/React-18.3-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-black?style=flat-square&logo=shadcnui)](https://ui.shadcn.com/)

</div>

---

## 📋 Table des matières

- [Présentation](#-présentation)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture du projet](#-architecture-du-projet)
- [Technologies utilisées](#-technologies-utilisées)
- [Installation et démarrage](#-installation-et-démarrage)
- [Structure des dossiers](#-structure-des-dossiers)
- [Rôles et permissions](#-rôles-et-permissions)
- [Composants clés](#-composants-clés)
- [API et intégrations](#-api-et-intégrations)
- [Contribution](#-contribution)
- [Licence](#-licence)

---

## 🎯 Présentation

EduSphere Central est une plateforme web de gestion scolaire complète, conçue pour digitaliser et simplifier la gestion administrative des établissements d'enseignement. Elle offre une interface moderne et intuitive pour tous les acteurs de la communauté éducative.

---

## ✨ Fonctionnalités

### 👑 Super Admin
- **Gestion des écoles** - Ajout, modification, suspension des écoles
- **Modules & Abonnements** - Gestion des modules disponibles par école
- **Administrateurs** - Gestion des comptes admin par école
- **Rapports globaux** - Statistiques et analytiques platform
- **Logs & Audit** - Suivi de toutes les actions sur la platform

### 🏫 Admin École
- **Années scolaires** - Gestion des années académiques
- **Semestres** - Organisation des périodes
- **Classes** - Gestion des classes et niveaux
- **Matières** - Configuration des matières enseignées
- **Enseignants** - Gestion du corps enseignant
- **Élèves** - Inscription et suivi des élèves
- **Parents** - Gestion des comptes parents
- **Bulletins** - Génération des bulletins scolaires
- **Rapports** - Rapports académiques et financiers
- **Paramètres** - Configuration de l'école

### 👨‍🏫 Enseignants
- **Mes classes** - Vue d'ensemble des classes assignées
- **Devoirs** - Création et gestion des devoirs
- **Compositions** - Organisation des examens
- **Notes** - Saisie et publication des notes
- **Messagerie** - Communication avec les parents

### 🎓 Élèves
- **Emploi du temps** - Consultation des cours
- **Devoirs** - Liste des devoirs à rendre
- **Notes** - Consultation des notes
- **Bulletins** - Accès aux bulletins
- **Notifications** - Alertes et informations

### 👨‍👩‍👧‍👦 Parents
- **Enfants** - Suivi des enfants inscrits
- **Bulletins** - Consultation des bulletins
- **Notes** - Suivi des performances
- **Emploi du temps** - Planning des cours
- **Paiements** - Gestion des frais scolaires
- **Messagerie** - Communication avec l'école

---

## 🏗️ Architecture du projet

```
src/
├── app/                    # Configuration et routes
│   ├── layouts/           # Layouts principaux
│   ├── navigation.ts      # Navigation principale
│   └── routes.tsx        # Définition des routes
├── components/            # Composants React
│   ├── dashboard/         # Composants du tableau de bord
│   ├── layout/            # Composants de mise en page
│   └── ui/               # Composants UI (shadcn/ui)
├── contexts/             # Contextes React
│   └── AuthContext.tsx   # Gestion de l'authentification
├── data/                 # Données mock
├── hooks/                # Hooks personnalisés
├── lib/                  # Utilitaires
├── pages/                # Pages de l'application
│   ├── dashboard/        # Tableaux de bord
│   ├── parent/           # Pages parents
│   ├── school-admin/     # Pages admin école
│   ├── student/          # Pages élèves
│   ├── super-admin/      # Pages super admin
│   └── teacher/          # Pages enseignants
├── types/                # Types TypeScript
└── App.tsx              # Point d'entrée principal
```

---

## 🛠️ Technologies utilisées

| Technologie | Version | Description |
|------------|---------|-------------|
| **React** | 18.3 | Bibliothèque UI |
| **TypeScript** | 5.0 | Typage statique |
| **Vite** | 5.0 | Build tool |
| **Tailwind CSS** | 3.4 | Framework CSS |
| **shadcn/ui** | Latest | Composants UI |
| **React Router** | 6.x | Routage |
| **Lucide React** | Latest | Icônes |
| **React Hook Form** | 7.x | Gestion des formulaires |
| **Zod** | 3.x | Validation des données |
| **Recharts** | 2.x | Graphiques |
| **Radix UI** | 1.x | Composants headless |

---

## 🚀 Installation et démarrage

### Prérequis

- Node.js 18+ 
- npm ou bun

### Installation

```bash
# Cloner le projet
git clone https://github.com/votre-repo/edusphere-central.git
cd edusphere-central

# Installer les dépendances
npm install
# ou avec bun
bun install

# Démarrer le serveur de développement
npm run dev
# ou avec bun
bun run dev
```

L'application sera accessible à `http://localhost:5173`

### Build pour la production

```bash
npm run build
# ou avec bun
bun run build
```

### Upload du logo école

L'upload du logo est maintenant géré par le backend. Aucun `.env` Cloudinary n'est nécessaire dans le front.

---

## 📁 Structure des dossiers

### Pages par rôle

```
src/pages/
├── dashboard/              # Tableaux de bord
│   ├── ParentDashboard.tsx
│   ├── SchoolAdminDashboard.tsx
│   ├── StudentDashboard.tsx
│   ├── SuperAdminDashboard.tsx
│   └── TeacherDashboard.tsx
├── parent/               # Pages spécifiques aux parents
│   ├── Bulletins.tsx
│   ├── Children.tsx
│   ├── Grades.tsx
│   ├── Notifications.tsx
│   ├── Payments.tsx
│   ├── Profile.tsx
│   └── Timetable.tsx
├── school-admin/         # Pages admin école
│   ├── AcademicYears.tsx
│   ├── Bulletins.tsx
│   ├── Classes.tsx
│   ├── Parents.tsx
│   ├── Reports.tsx
│   ├── Semesters.tsx
│   ├── Settings.tsx
│   ├── Students.tsx
│   ├── Subjects.tsx
│   └── Teachers.tsx
├── student/              # Pages spécifiques aux élèves
│   ├── Assignments.tsx
│   ├── Bulletins.tsx
│   ├── Grades.tsx
│   ├── Notifications.tsx
│   ├── Profile.tsx
│   └── Timetable.tsx
├── super-admin/          # Pages super admin
│   ├── Logs.tsx
│   ├── Modules.tsx
│   ├── PlatformSettings.tsx
│   ├── Reports.tsx
│   ├── SchoolAdmins.tsx
│   ├── Schools.tsx
│   └── Stats.tsx
└── teacher/              # Pages spécifiques aux enseignants
    ├── Assignments.tsx
    ├── Exams.tsx
    ├── Grades.tsx
    ├── Messages.tsx
    ├── MyClasses.tsx
    └── Profile.tsx
```

---

## 👥 Rôles et permissions

| Rôle | Description | Permissions |
|------|-------------|-------------|
| **super_admin** | Super administrateur | Gestion complète de la plateforme |
| **school_admin** | Administrateur d'école | Gestion de son établissement |
| **director** | Directeur | Supervision et validation |
| **teacher** | Enseignant | Gestion des cours et notes |
| **student** | Élève | Consultation de ses données |
| **parent** | Parent | Suivi de ses enfants |
| **accountant** | Comptable | Gestion financière |

---

## 🎨 Composants clés

### DataList

Composant réutilisable pour l'affichage des listes avec:
- Recherche par mot-clé
- Tri par colonne
- Filtres multiples
- Vue liste/grille
- Pagination

```tsx
<DataList
  data={items}
  columns={columns}
  searchKey="name"
  filterOptions={filters}
  defaultView="list"
  itemsPerPage={10}
/>
```

### Dashboard Cards

Cartes de statistiques avec graphiques:
- StatsCard.tsx - Cartes de métriques
- Charts.tsx - Graphiques Recharts
- ActivityFeed.tsx - Fil d'activité

### Composants UI

Basés sur shadcn/ui:
- Button, Card, Badge, Avatar
- Dialog, Dropdown, Select
- Table, Pagination
- Form, Input, Label
- Tabs, Toast, Tooltip

---

## 🔌 API et intégrations

### Authentification

Le projet utilise un contexte d'authentification (`AuthContext`) avec:
- Login/logout
- Switch de rôle (pour le développement)
- Protection des routes
- Gestion des tokens

### Données mock

Les données sont stockées dans:
- `src/data/mockSchools.ts` - Écoles mock
- Types dans `src/types/`

### Backend (à implémenter)

Structure recommandée pour l'API:
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/schools
POST   /api/schools
PUT    /api/schools/:id
DELETE /api/schools/:id
GET    /api/users
```

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez suivre ces étapes:

1. Fork le projet
2. Créer une branche (`git checkout -b feature/Amelioration`)
3. Commit les changements (`git commit -m 'feat: Ajouter nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/Amelioration`)
5. Ouvrir une Pull Request

### Convention de commit

- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage du code
- `refactor`: Refactorisation
- `test`: Tests
- `chore`: Maintenance

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 📞 Contact

- **Email**: contact@edusphere.com
- **Site web**: https://edusphere.com
- **GitHub**: https://github.com/edusphere

---

<div align="center">

**Développé avec ❤️ par l'équipe EduSphere**

</div>
