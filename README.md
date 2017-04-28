# drawashape
Draw 2D and 3D scenes (using three.js) in HTML DOM and gives usable simple methods to work with drawed shapes.

# Contenu de l'API
## Action sur l'API
### Création de la Scene et des DrawZones
* **new DrawZone.Scene()** Retourne une Scene contenant un shape correspondant à l'échelle.

### Actions sur la Scene
* OK **Scene.draw2Din($el: DOM)** Affiche la DrawZone2D de la Scene dans l'élément $el donné. 
* OK **Scene.draw3Din($el: DOM)** Affiche la DrawZone3D de la Scene dans l'élément $el donné.
* OK **Scene.setSelectionColor(color: hex) : void** -> Change la couleur des shapes sélectionnés.
* OK **Scene.setColor(color: hex) : void** -> Détermine la couleur des shapes futurs.
* OK **Scene.setDrawType(type: str) : void** -> Détermine le type des shapes futurs ("rect", "line")
* OK **Scene.getSelection() : Shape[]** -> Retourne un tableau contenant tous les shapes sélectionnés dans la zone.
* OK **Scene.getSelectionByParams(param: {}) : Shape[]** -> Retourne un tableau contenant les shapes sélectionnés répondant aux paramètres passés (color, type, ...).
* OK **Scene.setSelectionDimension({stroke: float, height: float, up: float}) : void** -> Détermine l'épaisseur/la hauteur/la distance au sol des shapes selectionnés.
* OK **Scene.setDimension({stroke: float, height: float, up: float}) : void** -> Détermine l'épaisseur/la hauteur/la distance au sol des shapes futurs.
* OK **Scene.setScale(val: float) : void** -> Détermine la valeur de l'échalle associée au shape d'échelle.
* OK **Scene.selectAll(param: {}) : void** -> Sélectionne tous les shapes de la Scene (mais pas l'échelle). Si un param est donnée, sélectionne uniquement les shapes répondant à ce paramètre.
* OK **Scene.deleteSelection() : int** -> Supprime les shapes selectionnés, retourne le nombre de shapes supprimés de la sorte.
* **Scene.toJSON() : json** -> Retourne l'export JSON de la Scene.
* **Scene.loadJSON(json:json) : void** -> Charge et trace les shapes du json passé en paramètre.

### Evenements de la Scene
* **shapeadded** -> lancé lorsqu'un shape a été tracé. **event.shape** contient le shape en question.
* **shapeupdated** -> lancé lorsqu'un shape a été redimensionné. **event.shape** contient le shape en question.
* **scaleupdated** -> lancé lorsque le shape de l'échelle a été redimensionné.
