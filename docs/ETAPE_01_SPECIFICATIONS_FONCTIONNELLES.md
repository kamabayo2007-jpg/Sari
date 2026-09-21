# SPÉCIFICATIONS FONCTIONNELLES DÉTAILLÉES — MALI RESELL
**Version :** 1.0.0  
**Statut :** Validé / Prêt pour conception  
**Cible :** Plateforme E-Commerce & Réseau de Revendeurs pour le Marché Malien  

---

## 1. CONTEXTE ET OBJECTIFS DU PROJET

### 1.1 Contexte socio-économique
Au Mali (particulièrement à Bamako et dans les grandes capitales régionales telles que Sikasso, Ségou, Kayes et Mopti), le commerce informel et le « social selling » (WhatsApp, Facebook, TikTok) représentent un vecteur économique majeur pour la jeunesse et les micro-entrepreneurs. Cependant, ces acteurs font face à des freins structurels majeurs :
- **Absence de capital de départ :** Difficulté à acheter et constituer un stock physique.
- **Risques d'invendus et de trésorerie bloquée :** Perte financière en cas de mévente.
- **Rupture d'approvisionnement et fiabilité des fournisseurs :** Prix d'achat instables et qualité variable.
- **Gestion logistique complexe :** Coûts élevés, adresses imprécises et incertitudes sur le dernier kilomètre.
- **Inadéquation bancaire :** Domination écrasante du cash et du Mobile Money (Orange Money, Moov Money, Wave).

### 1.2 Objectifs stratégiques de MaliResell
MaliResell est conçu comme un **écosystème B2B2C centralisé** permettant de lever ces barrières :
1. **Démocratiser l'entrepreneuriat commercial :** Permettre à tout Malien de démarrer une activité de revente sans capital initial et sans gestion de stock (modèle dropshipping/reselling localisé).
2. **Offrir un débouché aux grossistes et fabricants locaux :** Centraliser l'approvisionnement auprès de fournisseurs certifiés garantissant volume et disponibilité.
3. **Optimiser le dernier kilomètre :** Structurer une flotte de livreurs dédiés avec géolocalisation ou repères urbains bamakois (places publiques, ronds-points, carrefours connus).
4. **Sécuriser les transactions financières :** Intégration du paiement à la livraison (Cash-On-Delivery) et des passerelles Mobile Money incontournables (Orange Money Mali, Moov Money Mali, Wave Mali), avec calcul automatique et transparent des commissions.

### 1.3 Modèle économique unitaire
Le modèle s'appuie sur une triple tarification transparente :
- **Prix d'Achat Fournisseur ($P_F$) :** Coût négocié avec le fournisseur (ex: 5 000 FCFA).
- **Prix Revendeur Plateforme ($P_R$) :** Prix de gros auquel MaliResell met le produit à disposition du revendeur (ex: 6 000 FCFA). Marge brute plateforme = $P_R - P_F$ (1 000 FCFA).
- **Prix de Vente Client Final ($P_C$) :** Prix fixé librement par le revendeur à son client, sous réserve de respecter le prix plancher imposé (ex: 10 000 FCFA).
- **Marge / Commission Revendeur ($M_R$) :** Calculée automatiquement selon la formule :
  $$M_R = P_C - P_R = 10\,000 - 6\,000 = 4\,000 \text{ FCFA}$$
La plateforme encaisse la totalité auprès du client et reverse le montant $M_R$ sur le portefeuille virtuel/compte Mobile Money du revendeur dès que la commande passe au statut `LIVREE`.

---

## 2. PÉRIMÈTRE DU SYSTÈME (SCOPE)

### 2.1 Périmètre inclus (In-Scope)
- Gestion multi-acteurs avec 5 rôles distincts (ADMIN, REVENDEUR, CLIENT, LIVREUR, FOURNISSEUR).
- Authentification sécurisée basée sur Spring Security 6 et JWT (JSON Web Token) avec persistance des sessions utilisateurs.
- Gestion du catalogue de produits multi-catégories, variantes et stocks physiques centralisés.
- Espace Revendeur : sélection de produits, personnalisation du prix de vente, génération de bons de commande et liens de partage.
- Espace Client : consultation du catalogue, panier, passage de commande avec ou sans compte, suivi en temps réel par référence unique.
- Espace Fournisseur : déclaration des approvisionnements, suivi des livraisons de stock en entrepôt, historique des réassorts.
- Espace Livreur : consultation des courses assignées, contact client, mise à jour des étapes de livraison et motif d'échec standardisé.
- Espace Administration : pilotage global, approbation des utilisateurs, affectation des livreurs, réconciliation des encaissements et suivi financier des marges.
- Moteur de calcul financier en Francs CFA (XOF), avec gestion des statuts de paiement (EN_ATTENTE, PAYE, REMBOURSE, ECHOUE).

### 2.2 Périmètre exclu initialement (Out-of-Scope phase 1)
- Facturation internationale ou multi-devises (seul le FCFA / XOF est supporté).
- Gestion d'entrepôts multiples distribués à l'international (périmètre restreint au Mali métropolitain et régional).

---

## 3. ACTEURS ET RÔLES DÉTAILLÉS

| Acteur | Rôle Système (`RoleName`) | Description et Responsabilités |
| :--- | :--- | :--- |
| **Administrateur** | `ROLE_ADMIN` | Superviseur général de la plateforme. Contrôle les comptes, valide les fiches produits, surveille les seuils de réapprovisionnement, arbitre les litiges, assigne les livraisons et gère les versements de commissions. |
| **Revendeur** | `ROLE_REVENDEUR` | Micro-entrepreneur ou commercial indépendant. Accède aux prix de gros ($P_R$), définit son prix de vente client ($P_C$), prospecte, enregistre les commandes pour ses clients finaux et encaisse ses marges nettes. |
| **Client Final** | `ROLE_CLIENT` | Acheteur et consommateur final. Découvre le catalogue public ou le catalogue partagé par un revendeur, passe commande, renseigne ses coordonnées précises et procède au règlement (cash ou Mobile Money). |
| **Livreur** | `ROLE_LIVREUR` | Agent logistique urbain. Récupère les colis préparés au hub/entrepôt central, effectue la tournée, valide la remise en main propre et collecte le règlement en espèces si COD. |
| **Fournisseur** | `ROLE_FOURNISSEUR` | Fabricant, importateur ou grossiste partenaire. Met ses références à disposition de la plateforme au prix d'achat conventionné ($P_F$), expédie les réassorts vers le hub central et consulte son historique de vente. |

---

## 4. FONCTIONNALITÉS EXHAUSTIVES PAR ACTEUR

### 4.1 Espace Administrateur (ADMIN)
- **Gestion des Utilisateurs :** Création, modification, activation/désactivation de comptes (Revendeurs, Livreurs, Fournisseurs).
- **Gestion du Référentiel Catalogue :**
  - Gestion des catégories et sous-catégories (nom, slug, description, image).
  - Gestion des fiches produits : libellé, SKU, code-barre, description, photos, dimensions/poids, prix fournisseur ($P_F$), prix revendeur plancher ($P_R$), prix client conseillé.
- **Gestion des Approvisionnements & Fournisseurs :** Validation des fiches fournisseurs, saisie et réception des bordereaux de réassort, réévaluation des prix d'achat.
- **Gestion des Stocks :**
  - Visualisation en temps réel des stocks théoriques, réservés et disponibles.
  - Configuration de seuils d'alerte de stock critique (`seuil_alerte`).
  - Journal d'audit des mouvements de stock (ENTREE, SORTIE_COMMANDE, AJUSTEMENT_INVENTAIRE, RETOUR).
- **Gestion des Commandes :**
  - Vue à 360° du cycle de vie des commandes.
  - Validation manuelle si anomalie détectée (anti-fraude).
  - Assignation d'une commande prête à un Livreur disponible.
- **Gestion des Paiements & Commissions :**
  - Contrôle des encaissements livreurs (cash collecté).
  - Validation et exécution des demandes de retrait des marges revendeurs vers leurs numéros Orange Money, Moov Money ou Wave.
- **Tableau de bord Statistique :** Volume d'affaires (GMV), marge nette plateforme, top revendeurs, top produits, taux d'échec de livraison.

### 4.2 Espace Revendeur (REVENDEUR)
- **Inscription & Onboarding :** Enregistrement autonome avec validation du numéro de téléphone malien (+223) et sélection du mode de versement favori (Orange Money / Moov Money / Wave).
- **Exploration du Catalogue B2B :**
  - Consultation des articles avec affichage du stock disponible et du prix revendeur ($P_R$).
  - Téléchargement des kits marketing (photos haute définition sans filigrane, argumentaires de vente, fiches techniques) pour diffusion sur WhatsApp, Facebook et TikTok.
- **Générateur de Vente & Fixation de Prix :**
  - Création de panier revendeur pour le compte d'un client tiers.
  - Saisie libre du prix de vente client ($P_C$) avec interdiction de descendre sous $P_R$.
  - Calcul dynamique en direct : Affichage immédiat du gain espéré : $Gain = (P_C - P_R) \times Quantité$.
- **Enregistrement de Commande :**
  - Saisie des informations de livraison du client final (Nom, Prénom, Téléphone principal, Téléphone secondaire, Ville, Commune, Quartier, Repère visuel / indication de rue).
  - Choix du mode de paiement souhaité par le client (À la livraison en espèces, Orange Money, Moov Money, Wave).
- **Portefeuille de Marges (Wallet) :**
  - Solde en attente (commandes confirmées ou en cours de livraison).
  - Solde disponible (commandes livrées et encaissées).
  - Historique des commissions créditées.
  - Formulaire de demande de retrait (virement Mobile Money sous 24h ouvrées).
- **Suivi des Ventes :** Tableau d'avancement des commandes clients avec statuts en direct.

### 4.3 Espace Client Final (CLIENT)
- **Catalogue & Navigation :** Recherche textuelle, filtrage par catégorie, tri par prix ou nouveautés.
- **Détail Produit :** Descriptif complet, galerie photos, disponibilité.
- **Tunnel de Commande Simplifié (Checkout adapté au Mali) :**
  - Commande possible sans mot de passe obligatoire (Guest Checkout avec authentification par SMS/téléphone).
  - Formulaire d'adresse optimisé pour le contexte local (Sélecteurs : Ville ex. Bamako -> Commune ex. Commune IV -> Quartier ex. Hamdallaye ACI 2000 -> Champ repère obligatoire ex. « En face de la pharmacie du rond-point »).
- **Suivi de Commande :** Consultation de l'état d'acheminement via le numéro de commande unique (ex: `CMD-2026-00892`).
- **Historique & Profil :** Consultation des commandes antérieures pour les clients disposant d'un compte.

### 4.4 Espace Livreur (LIVREUR)
- **Feuille de Route Quotidienne :** Liste des colis assignés par l'administrateur avec statut prioritaire.
- **Fiche Course Détaillée :**
  - Coordonnées client, numéro appelable en 1-clic (`tel:+223...`).
  - Adresse et repères géographiques textuels.
  - Montant exact à encaisser (frais d'article + frais de livraison éventuels).
- **Mise à jour des Statuts de Livraison :**
  - Passage de la commande à `EXPEDIEE` (départ de l'entrepôt).
  - Passage à `LIVREE` : saisie obligatoire du montant encaissé et signature numérique ou code OTP de confirmation client.
  - Déclaration d'échec : passage à `ECHOUEE` avec motif normé (Client injoignable, Client absent, Client refuse le colis, Adresse introuvable, Erreur article).
- **Bilan d'Encaissement :** Total des sommes liquides détenues à reverser à la caisse centrale de MaliResell en fin de tournée.

### 4.5 Espace Fournisseur (FOURNISSEUR)
- **Fiches Produits Rattachées :** Consultation des articles fournis par son entreprise avec indication du prix d'achat convenu ($P_F$).
- **Avis d'Expédition / Réassort :** Notification à l'administrateur d'un approvisionnement en cours (quantités, date d'arrivée estimée).
- **Suivi des Stocks & Ventes :** Statistiques de rotation de ses références pour anticiper les fabrications ou importations.

---

## 5. RÈGLES MÉTIER NUMÉROTÉES (RM-01 À RM-20)

### Tarification et Marges
- **RM-01 (Hiérarchie des Prix) :** Pour tout article et toute ligne de commande, l'inégalité stricte suivante doit être respectée :  
  $$\text{Prix Fournisseur } (P_F) < \text{Prix Revendeur } (P_R) \le \text{Prix Client } (P_C)$$
  Aucun revendeur ne peut définir un prix client inférieur au prix revendeur minimal configuré par l'administrateur.
- **RM-02 (Calcul Automatique de la Marge Revendeur) :** La marge brute revendeur unitaire ($M_u$) est égale à $P_C - P_R$. Pour une quantité $Q$, la marge totale de la ligne est $M_{ligne} = (P_C - P_R) \times Q$.
- **RM-03 (Marge Plateforme) :** La marge brute de la plateforme MaliResell sur chaque unité vendue est calculée par $M_{plat} = P_R - P_F$.
- **RM-04 (Devise Obligatoire) :** Tous les montants financiers sont exprimés et stockés en **Francs CFA (XOF)** sous forme d'entiers sans décimales (la plus petite unité monétaire en circulation étant 1 FCFA).

### Gestion des Stocks
- **RM-05 (Réservation de Stock à la Commande) :** Dès qu'une commande est créée avec le statut initial `EN_ATTENTE`, la quantité demandée est déduite du **stock disponible** et affectée au **stock réservé**.
- **RM-06 (Contrôle d'Épuisement) :** Une commande ne peut être enregistrée si la quantité demandée dépasse le stock disponible actuel :  
  $$\text{Quantité commandée} \le \text{Stock physique} - \text{Stock réservé}$$
- **RM-07 (Décrémentation Définitive du Stock Physique) :** Le stock physique réel est définitivement décrémenté et la réservation libérée lorsque la commande passe à `EXPEDIEE`.
- **RM-08 (Restitution de Stock sur Annulation ou Échec) :** Si une commande passe au statut `ANNULEE` ou `ECHOUEE`, les articles sont automatiquement réintégrés dans le stock disponible de la plateforme, avec traçabilité d'un mouvement d'ajustement.

### Cycle de Vie et Statuts des Commandes
- **RM-09 (Machine à États Finis des Commandes) :** Une commande respecte strictement la transition d'états suivante :
  - `EN_ATTENTE` $\rightarrow$ `CONFIRMEE` ou `ANNULEE`
  - `CONFIRMEE` $\rightarrow$ `EN_PREPARATION` ou `ANNULEE`
  - `EN_PREPARATION` $\rightarrow$ `EXPEDIEE` ou `ANNULEE`
  - `EXPEDIEE` $\rightarrow$ `LIVREE` ou `ECHOUEE`
  - Les statuts `LIVREE`, `ANNULEE` et `ECHOUEE` sont terminaux (toute modification ultérieure nécessite une action super-administrateur d'avoir/retour).
- **RM-10 (Unicité de la Référence de Commande) :** Chaque commande génère une référence publique unique au format alphanumérique immuable : `MR-YYYYMMDD-XXXX` (ex: `MR-20260919-0142`).
- **RM-11 (Éligibilité à l'Annulation) :** Une commande ne peut être annulée par le client ou le revendeur que si son statut actuel est `EN_ATTENTE` ou `CONFIRMEE`. Dès qu'elle entre en `EN_PREPARATION`, seule l'administration peut autoriser une annulation.

### Portefeuille Revendeur et Éligibilité des Gains
- **RM-12 (Déblocage Conditionnel des Marges) :** La marge revendeur associée à une commande n'est créditée au portefeuille « Solde Disponible » que lorsque la commande atteint de manière vérifiée le statut `LIVREE` et que le règlement est certifié `PAYE`.
- **RM-13 (Annulation de Commission) :** En cas de commande `ANNULEE` ou `ECHOUEE`, la marge correspondante inscrite en solde prévisionnel est annulée et remise à zéro.
- **RM-14 (Seuil Minimal de Retrait) :** Le montant minimum d'une demande de virement de commission vers un compte Mobile Money est fixé à **2 000 FCFA**.
- **RM-15 (Solde Non Négatif) :** Le solde disponible d'un revendeur ne peut en aucun cas être inférieur à 0 FCFA.

### Logistique et Rapprochement Financier
- **RM-16 (Assignation Unique de Livraison) :** Une commande au statut `EN_PREPARATION` ne peut être assignée qu'à un et un seul livreur actif à la fois.
- **RM-17 (Collecte des Espèces - COD) :** Lorsque le mode de paiement est « Cash on Delivery », le livreur est financièrement garant du montant total exact de la facture ($P_C \times Q + \text{frais}$) jusqu'à reversement au caissier central.
- **RM-18 (Motif d'Échec de Livraison) :** Toute transition vers le statut `ECHOUEE` exige la saisie obligatoire d'un motif normé parmi :
  - `CLIENT_INJOIGNABLE`
  - `CLIENT_ABSENT`
  - `CLIENT_REFUS_PRIX_OU_PRODUIT`
  - `ADRESSE_INACCESSIBLE`
  - `COLIS_ENDOMMAGE`

### Sécurité et Données
- **RM-19 (Format des Identifiants Maliens) :** Les numéros de téléphone doivent correspondre au plan de numérotation de l'AMRTP (Autorité Malienne de Régulation des Télécommunications et Postes), soit 8 chiffres précédés ou non de l'indicatif international (+223) : préfixes Orange (7x, 8x), Moov (6x), Telecel (5x).
- **RM-20 (Cloisonnement des Données Revendeurs) :** Un revendeur n'a accès qu'à ses propres commandes, clients et statistiques financières. Seul l'administrateur dispose d'une vision transverse de la plateforme.

---

## 6. CONTRAINTES TECHNIQUES ET LÉGALES (CONTEXTE MALIEN)

### 6.1 Contraintes Techniques Locales
1. **Connectivité Mobile Instable et Réseau 3G/4G Variable :**
   - L'architecture frontend doit minimiser le poids des requêtes, supporter les connexions lentes et offrir une mise en cache efficace.
   - Les photos de produits doivent être compressées automatiquement au format WebP/JPEG optimisé.
2. **Système d'Adressage Informel :**
   - Contrairement aux pays occidentaux, Bamako et les régions n'ont pas de code postal ni de numérotation de rue universelle.
   - Le système d'information requiert une structure d'adresse contextuelle :
     - **Ville / Région** (ex: Bamako, Koulikoro, Sikasso)
     - **Commune** (ex: Commune I à VI pour le district de Bamako)
     - **Quartier** (ex: Badalabougou, Baco-Djicoroni, Yirimadio, Faladié)
     - **Point de repère descriptif obligatoire** (ex: « À 50m après la station Shell, porte verte »)
     - **Deuxième numéro de contact obligatoire** pour joindre le destinataire en cas de boîte vocale ou panne de batterie.
3. **Usage Prédominant des Téléphones Mobiles :**
   - Le frontend doit être résolument **Mobile-First**, fluide sur des écrans de smartphones Android économiques.
4. **Intégration Mobile Money :**
   - Support architectural direct pour les trois opérateurs dominants :
     - **Orange Money Mali** (via API Orange Partner / Webhook de notification)
     - **Moov Money Mali** (Flooz)
     - **Wave Mali** (QR Code et Deep link / Push transaction)
   - Architecture découplée (`PaymentGatewayAdapter`) permettant de valider les paiements en mode manuel (saisie de référence de transaction SMS par l'admin) et en mode automatique (API REST Webhooks).

### 6.2 Contraintes Juridiques et Règlementaires
1. **Règlementation UEMOA sur la Monnaie Électronique :** Respect des directives de la BCEAO régissant les transactions financières et l'intermédiation de paiement.
2. **Protection des Données Personnelles au Mali :** Conformité avec la **Loi N° 2013-015 du 21 mai 2013** portant protection des données à caractère personnel en République du Mali, régulée par l'APDP (Autorité de Protection des Données à caractère Personnel). Stockage sécurisé, mots de passe hashés avec BCrypt et consentement utilisateur.
3. **Traçabilité Commerciale :** Conservation des journaux d'audit des transactions et commandes pour une durée minimale conforme au code de commerce malien.

---

## 7. PROCESSUS MÉTIER DÉTAILLÉS

### 7.1 Processus 1 : Commande et Réservation de Stock
```text
[Client / Revendeur]           [Système MaliResell]             [Base de Données / Stock]
        |                               |                                  |
        |--- 1. Sélectionne produit --->|                                  |
        |    et fixe Prix Vente         |                                  |
        |                               |--- 2. Vérifie stock disponible ->|
        |                               |<-- 3. Stock OK (Qté >= Demande)--|
        |--- 4. Valide panier & infos ->|                                  |
        |       livraison + repères     |--- 5. Crée Commande (EN_ATTENTE)-|
        |                               |--- 6. Déplace vers Stock Réservé-|
        |<-- 7. Réf Commande générée ---|                                  |
```

### 7.2 Processus 2 : Préparation et Expédition Logistique
```text
[Administrateur]               [Système MaliResell]               [Livreur Assigné]
        |                               |                                  |
        |--- 1. Confirme commande ----->|                                  |
        |    (Passe à CONFIRMEE)        |                                  |
        |--- 2. Déclenche préparation ->|                                  |
        |    (Passe à EN_PREPARATION)   |                                  |
        |--- 3. Assigne au Livreur X -->|--- 4. Notification / Affichage ->|
        |                               |       sur feuille de route       |
        |                               |<-- 5. Accepte et prend le colis -|
        |                               |    (Passe à EXPEDIEE,            |
        |                               |     Stock physique décrémenté)   |
```

### 7.3 Processus 3 : Livraison et Encaissement Financier
```text
[Livreur]                     [Client Final]                  [Système MaliResell]
    |                               |                                  |
    |--- 1. Appel & localisation -->|                                  |
    |--- 2. Présentation du colis ->|                                  |
    |                               |--- 3. Remise du paiement Cash -->|
    |                               |       ou validation Mobile Money |
    |--- 4. Enregistre succès ----->|                                  |
    |    (Passe à LIVREE + PAYE)    |=================================>|
    |                                                                  |--- 5. Clôture livraison
    |                                                                  |--- 6. Crédite le Wallet
    |                                                                  |       du Revendeur (+Marge)
    |                                                                  |--- 7. Met à jour la caisse
```

### 7.4 Processus 4 : Gestion de l'Échec de Livraison
```text
[Livreur]                     [Système MaliResell]             [Entrepôt / Stock]
    |                               |                                  |
    |--- 1. Constate échec -------->|                                  |
    |    (Ex: Injoignable x3)       |                                  |
    |--- 2. Déclare ECHOUEE ------->|                                  |
    |    + Saisie Motif             |--- 3. Alerte Administrateur ---->|
    |                               |--- 4. Réintègre quantité ------->|
    |                               |       dans Stock Disponible      |
    |                               |--- 5. Annule marge prévisionnelle|
```

---

## 8. SYNTHÈSE DES ÉTATS ET ACTIONS POSSIBLES

| Statut Commande | Signification | Actions Autorisées | Acteurs Habilités |
| :--- | :--- | :--- | :--- |
| `EN_ATTENTE` | Commande enregistrée, stock réservé. | Confirmer, Annuler. | Client, Revendeur, Admin |
| `CONFIRMEE` | Validée pour préparation logistique. | Lancer préparation, Annuler. | Admin |
| `EN_PREPARATION` | Colis en cours d'emballage au hub. | Assigner livreur, Passer en expédition. | Admin |
| `EXPEDIEE` | Colis pris en charge par le livreur sur le terrain. | Valider livraison, Déclarer échec. | Livreur, Admin |
| `LIVREE` | Colis remis au client, paiement encaissé. | Débloquer marge, archiver. (État terminal) | Système, Admin |
| `ANNULEE` | Abandonnée avant expédition. | Remettre stock en vente. (État terminal) | Client, Revendeur, Admin |
| `ECHOUEE` | Tentative infructueuse sur le terrain. | Réintégrer stock, rapport d'anomalie. | Livreur, Admin |

---
*Ce document forme le socle fonctionnel et contractuel pour l'Étape 2 (Analyse fonctionnelle : cas d'usage et flux UML/textuels).*
