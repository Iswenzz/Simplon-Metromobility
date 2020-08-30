![](https://i.imgur.com/XFvRaaO.png)
# Simplon JS TP
![](https://i.imgur.com/kQ7uq7k.jpg)

# Metromobility
Vous devez réaliser un site internet responsive dont l’objectif est de pouvoir consulter les horaires de toutes les lignes des transports en commun de l’agglomération Grenobloise.
Livrables

Le projet devra être déposé sur Gitlab et sur Simplonline. Vos prototypes seront joints à votre rendu sur Simplonline. Vous devrez nous donner accès à votre recettage. (Excel dans GIT ou dans Simplonline)
Contexte du projet

Vous utiliserez l’API de la métro : https://www.mobilites-m.fr/pages/opendata/OpenDataApi.html

Ce service devra comporter à minima les spécifications suivantes:
* une liste de toutes les lignes existantes avec leurs codes couleurs et leurs informations respectives (numéro de ligne / destination / code couleur etc)
* chaque catégorie de transport doit avoir son icône dédiée (bus / tram etc)
* le détail de chaque ligne qui contiendra toutes les informations utiles (horaires / arrêts / etc)
* vous devrez aussi créer une carte interactive qui présentera les informations suivantes :
	* le tracé de la ligne quand vous êtes sur sa fiche
	* Bonus : les différents arrêts de la ligne
* vous devez avoir un système pour enregistrer vos lignes favorites (localstorage suffisant)
* vous devez avoir un système d’annonces pour informer les usagers des règles sanitaires en vigueur : ce système devra se lancer au chargement de la page en tant que bandeau haut. Il y aura bien entendu la possibilité de le fermer mais il devra se ré-ouvrir au bout de quelques minutes.

_Bonus : un système de notifications sur les informations de trafic en temps réel au chargement de la page_

Vous êtes libres de la maquette finale mais devez tenir compte d’une contrainte forte : les utilisateurs vont utiliser en majorité votre outil avec un téléphone portable => mobile first ;-)

## Contraintes techniques
Ce projet devra être réalisé avec :
* Framework CSS interdits => que du custom
* SASS
* jQuery obligatoire avec Ajax mais aucun framework additionnel
* vous utiliserez Leaflet pour les cartes + geojson
* toutes vos librairies doivent être installées avec NPM : Animate.css etc
* le projet doit passer les tests de contrastes de couleurs
* Webpack peut être utilisé
* Bonus : ESlint + stylelint

**Recettage : Utiliser le système de recettage pour relever les bugs : soit sur le drive soit un gestionnaire de projet. Des groupes seront générés pour recetter vos projets.**

## Bonus “Must Have”
Au premier lancement de votre outil vous demandez des informations à votre utilisateur :
* son prénom, pour afficher un petit message avec par exemple “Bonjour Cédric”
* son genre (pour éventuellement adapter des éléments de design ou de contenu)
* choix d’un avatar dans une liste de choix prédéfinis
* géolocalisation pour afficher les points proches de sa position
* un dark-mode

## Modalités pédagogiques
Ce projet est à rendre pour le vendredi 04 Septembre 2020.
