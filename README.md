# drawashape
Draw 2D and 3D scenes (using three.js) in HTML DOM and gives usable simple methods to work with drawed shapes.

# Getting started
``` html
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset=utf-8>
            <title>My first three.js app</title>
            <style>
                body { margin: 0; }
                canvas { width: 50%; height: 100% }
                #canvas3D { position: absolute; left: 50%; top:0; }
            </style>
        </head>
        <body>
            <div id="canvas2D" class="name"> </div>
            <div id="canvas3D" class="name"> </div>

            <script src="js/three.js"></script>
            <script src="js/underscore-min.js"></script>
            <script src="js/jquery.js"></script>

            <script src="js/drawashape.js"></script>
            
            <script>
                $(document).ready(function() {
                    var scene = new DRAWASHAPE.Scene();

                    scene.draw2Din(document.getElementById("canvas2D"));
                    scene.draw3Din(document.getElementById("canvas3D"));

                    var render = function () {
                        requestAnimationFrame( render );
                        scene.renderer2D.render(scene.threeScene, scene.camera2D);
                        scene.renderer3D.render(scene.threeScene, scene.camera3D);
                    };

                    render();
                });
            </script>

        </body>
    </html>
```

# API content

## Actions on the Scene
* **Scene.draw2Din($el: DOM)** Display DrawZone2D of the Scene in given element $el. 
* **Scene.draw3Din($el: DOM)** Display DrawZone3D of the Scene in given element $el.
* **Scene.setSelectionColor(color: hex) : void** -> Change selected Shapes color to given one.
* **Scene.setColor(color: hex) : void** -> Set the color for further drawed Shapes.
* **Scene.setDrawType(type: str) : void** -> Set the type of further drawed Shapes ("rect", "line")
* **Scene.getSelection() : Shape[]** -> Return a list of all selected Shapes.
* **Scene.getSelectionByParams(param: {}) : Shape[]** -> Return a list of all selected Shapes with given caracteristics (color, type, ...).
* **Scene.setSelectionDimension({stroke: float, height: float, up: float}) : void** -> Set stroke, height and up of selected Shapes.
* **Scene.setDimension({stroke: float, height: float, up: float}) : void** -> Set stroke, height, up of futur drawed Shapes.
* **Scene.setScale(val: float) : void** -> Set the value for Scale Shape.
* **Scene.selectAll(param: {}) : void** -> Selec all Shapes in the Shence (without scale Shape). If param is given, select only those corresponding to this param.
* **Scene.deleteSelection() : int** -> Delete selected Shapes. Return the number of deleted Shapes this way.
* **Scene.toJSON() : json** -> Return JSON export of the Scene.
* **Scene.loadJSON(json:json) : void** -> Load JSON in the Scene.

## Events in the Scene
* **shapeadded** -> raised when a Shape has been drawn. **event.shape** contain the drawed Shape.
* **shapeupdated** -> raised when a Shape has been resized. **event.shape** contain the drawed Shape.
* **scaleupdated** -> raised when Scale shape is resized.
