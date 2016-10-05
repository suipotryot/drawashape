(function(_) {
    SELECTED = [];
    COLOR = 0xffffff;
    INTERSECTED = null;
    DRAGGED = null;
    DRAWS = [];
    // Define our constructor
    this.Scene = function(options) {
        var defaults = {
            ambiantLightShow: true,
            ambiantLightColor: 0x505050,

            axisHelperShow: true,
            axisHelperSize: 5,

            cam2Dleft: 20,
            cam2Dright: -20,
            cam2Dtop: -10,
            cam2Dbottom: 10,
            cam2Dnear: 0.1,
            cam2Dfar: 100,

            cam3Dfov: 30,
            cam3Daspect: 2,
            cam3Dnear: 1,
            cam3Dfar: 1000,

            gridHelperShow: true,
            gridHelperSize: 10,
            gridHelperStep: 1,
        };
        this.scale = 1;
        
        this.threeScene = new THREE.Scene();

        // Create options by extending defaults
        this.options = _.extend(defaults, options);

        // Set the Camera 2D of the scene
        this.camera2D = _.extend(new THREE.OrthographicCamera(
                                        this.options.cam2Dleft,
                                        this.options.cam2Dright,
                                        this.options.cam2Dtop,
                                        this.options.cam2Dbottom,
                                        this.options.cam2Dnear,
                                        this.options.cam2Dfar),
                                Camera2d);
        this.camera2D.initPosition();
        this.threeScene.add(this.camera2D);

        // Set the Camera 3D of the scene
        this.camera3D = _.extend(new THREE.PerspectiveCamera(
                                        this.options.cam3Dfov,
                                        this.options.cam3Daspect,
                                        this.options.cam3Dnear,
                                        this.options.cam3Dfar),
                                Camera3d);
        this.camera3D.initPosition();
        this.threeScene.add(this.camera3D);

        // Set the Grid Helper of the scene
        if (this.options.gridHelperShow) {
            var gridHelper = new THREE.GridHelper(
                this.options.gridHelperSize,
                this.options.gridHelperStep);
            gridHelper.rotateX( Math.PI / 2 );
            this.threeScene.add(gridHelper);
        }

        // Set the Axis Helper of the scene
        if (this.options.axisHelperShow) {
            this.threeScene.add(new THREE.AxisHelper(
                this.options.axisHelperSize));
        }

        // Set the spot light of the scene
        var light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 1, 1).normalize();
        light.castShadow = true;
        this.threeScene.add(light);

        // Set the plane of the scene (used for intersect detection)
        this.plane = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( 50, 50, 8, 8 ),
            new THREE.MeshBasicMaterial( { visible: false } )
        );
        this.threeScene.add(this.plane);

        // The Renderer
        if (WebglAvailable()) {
            this.renderer2D = new THREE.WebGLRenderer();
            this.renderer2D.setClearColor(0xf0f0f0);
            this.renderer2D.setSize(window.innerWidth, window.innerHeight);
            this.renderer3D = new THREE.WebGLRenderer();
            this.renderer3D.setClearColor(0xf0f0f0);
            this.renderer3D.setSize(window.innerWidth, window.innerHeight);
        } else {
            this.renderer2D = new THREE.CanvasRenderer({
                preserveDrawingBuffer: true,
            });
            this.renderer3D = new THREE.CanvasRenderer({
                preserveDrawingBuffer: true,
            });
        }

        // The Raycaster
        this.raycaster = new THREE.Raycaster();
        this.domElement2D = this.renderer2D.domElement;
        this.domElement3D = this.renderer3D.domElement;

        this.scaleShape = LineArrowFactory.makeLine();
        this.threeScene.add(this.scaleShape);

        this.bindEvents();

    };

    // METHODS
    /**
     * @desc Set the color of the instance
     * @param hex color
     * @param hex colororig
     * @return null
     */
    Scene.prototype.setColor = function(color, colororig=false) {
        COLOR = color;
        if (colororig) {
            for (var shape in this.shapes) {
                //TODO
            }
        }
    },

    /**
     * @desc Return the current color used for shapes.
     * @return hex
     */
    Scene.prototype.getColor = function() {
        return COLOR;
    },

    Scene.prototype.setDrawType = function(drawtype) {
        this.drawtype = drawtype;
    },

    Scene.prototype.getDrawType = function(drawtype) {
        return this.drawtype;
    },

    /**
     * @desc Set the given dimension for futur shapes. If color is passed,
     * also change all existing shapes of the color to those dimensions.
     * @param Object fields
     * @param hex color
     */
    Scene.prototype.setDimension = function(fields, color=false) {
        for (var field in fields) {
            this[field] = fields[field];
        }
        if (color) {
            for (var shape in this.shapes) {
                if (this.shapes[shape].color === color) {
                    this.shapes[shape].setDimension(fields);
                }
            }
            
        }
    },

    /**
     * @desc Return the dimension of the passed fieldname
     * @param String fieldname
     * @return float
     */
    Scene.prototype.getDimension = function(fieldname) {
        return this[fieldname];
    },

    Scene.prototype.draw2Din = function(el) {
        el.appendChild(this.domElement2D);
    };

    Scene.prototype.draw3Din = function(el) {
        el.appendChild(this.domElement3D);
    };

    Scene.prototype.intersectPlane = function(mousePosition) {
        this.raycaster.setFromCamera(mousePosition, this.camera2D);
        var intersects = this.raycaster.intersectObject(this.plane);
        return intersects[0];
    };

    /**
     * Return an Shape containing mouse interseciton with the fisrt met target
     * in given list.
     */
    Scene.prototype.intersectAny = function(mousePosition) {
        this.raycaster.setFromCamera(mousePosition, this.camera2D);
        var intersects = this.raycaster.intersectObjects(this.threeScene.children, true);
        var res = [];
        for (var i = 0; i < intersects.length; i++) {
            if (intersects[i].object.parent != this.threeScene) {
                res.push(intersects[i]);
            }
        }
        return res;
    };

    /**
     * @desc Return the current selection of the Scene
     * @return []
     */
    Scene.prototype.getSelection = function() {
        return SELECTED;
    },

    /**
     * @desc Select every shape in the scene. Return the array of shapes
     * selected this way.
     */
    Scene.prototype.selectAll = function(color=false) {
        SELECTED = [];
        for (var o in DRAWS) {
            DRAWS[o].select();
            SELECTED.push(DRAWS[o]);
        }
        return DRAWS;
    },

    /**
     * @desc Delete all shapes in current selection
     */
    Scene.prototype.deleteSelection = function() {
        for (var o in SELECTED) {
            delete DRAWS[SELECTED[o].uuid];
            this.threeScene.remove(SELECTED[o]);
        }
        SELECTED = [];
    },

    /**
     * @desc Set the scale of the scene. Scale every shape already drawed
     * with the ratio bietween old and new scale
     * @param float scale
     */
    Scene.prototype.setScale = function(scale) {
        var ratio = scale / this.scale;
        for (var d in DRAWS) {
            DRAWS[d].scale.set(DRAWS[d].scale.x,
                               DRAWS[d].scale.y * ratio,
                               DRAWS[d].scale.z * ratio);
        }
        
        this.scale = scale;
    },
    // END METHODS


    // BIND EVENTS
    /**
     * @desc 
     */
    Scene.prototype.bindEvents = function() {
        var self = this;
        this.width = this.renderer2D.domElement.width;
        this.height = this.renderer2D.domElement.height;
        // 3D ZONE
        this.domElement3D.addEventListener( 'MozMousePixelScroll', function(event) {
            if (! event.ctrlKey)
                return;
            event.preventDefault();
            event.stopPropagation();

            var delta = 0;
            if (event.wheelDelta) {
                // WebKit / Opera / Explorer 9
                delta = event.wheelDelta / 40;
            } else if (event.detail) {
                // Firefox
                delta = - event.detail / 3;
            }

            self.camera3D.updateRadious(delta);
        });

        this.domElement2D.addEventListener( 'MozMousePixelScroll', function(event) {
            if (! event.ctrlKey)
                return;
            event.preventDefault();
            event.stopPropagation();

            var delta = 0;
            if (event.wheelDelta) {
                // WebKit / Opera / Explorer 9
                delta = event.wheelDelta / 40;
            } else if (event.detail) {
                // Firefox
                delta = - event.detail / 3;
            }

            self.camera2D.updateRadious(delta);
        });

        var getMousePosition = function(event) {
            var rect = self.renderer2D.domElement.getBoundingClientRect();
            var style = window.getComputedStyle(self.renderer2D.domElement);
            var paddingLeft = parseInt(style["padding-left"]);
            var x = ((event.clientX - rect.left - paddingLeft) / self.width) * 2 - 1;
            var y = - ((event.clientY - rect.top) / self.height) * 2 + 1;
            return {x: x, y: y};
        };

        // WHEN USER DRAG IN THE SCREEN (2D) TO MOVE THE CAMERA
        var moveAction2D = function(event) {
            var pos = getMousePosition(event);
            self.camera2D.updatePosition(self.previousCam2DPos, pos);
            self.previousCam2DPos = pos;
            self.camera2D.updateMatrix();
        };

        // WHEN USER DRAG IN THE SCREEN (3D) TO MOVE THE CAMERA
        var moveAction3D = function(event) {
            self.camera3D.updateEvent(event);
            self.camera3D.updateMatrix();
        };

        // WHEN USER JUST MOVE MOUSE IN 2D VIEW (HOVER OR NOT)
        this.domElement2D.addEventListener("mousemove", function(event) {
            var inter = self.intersectAny(getMousePosition(event));
            if (inter.length > 0) {
                if (INTERSECTED != inter[0].object) {
                    if (INTERSECTED) INTERSECTED.unhover();
                    INTERSECTED = inter[0].object;
                    INTERSECTED.hover();
                }
            } else {
                if (INTERSECTED) INTERSECTED.unhover();
                INTERSECTED = null;
            }
        });

        // WHEN USER DRAGS A SHAPE
        var drag2D = function (event) {
            var inter = self.intersectPlane(getMousePosition(event));
            DRAGGED.drag2D(inter.point);
        }

        // WHEN USER CLICK
        /**
         * @desc When user clicks in 2D zone. He can:
         * 1. Start to navigate in the zone (using ctrl or mouse wheel clic);
         * 2. Create a Shape;
         * 3. Start to move a Shape.
         */
        this.domElement2D.addEventListener('mousedown', function(event) {
            // 1. Start to navigate
            if (event.ctrlKey || 4 == event.buttons) {
                self.previousCam2DPos = getMousePosition(event);
                self.domElement2D.addEventListener('mousemove', moveAction2D);
            } else {
                var pos = getMousePosition(event);
                var inter = self.intersectAny(pos);
                if (inter.length == 0) {
                // 2. Create a Shape
                    var inter = self.intersectPlane(pos);
                    var line = LineFactory.makeLine();
                    line.translateX(inter.point.x);
                    line.translateY(inter.point.y);
                    self.threeScene.add(line);
                    for (var o in SELECTED) {
                        SELECTED[o].unselect();
                    }
                    SELECTED = [line];
                    DRAWS[line.uuid] = line;
                } else {
                // 3. Start Dragging shape
                    inter[0].object.parent.select();
                    DRAGGED = inter[0].object;
                    self.domElement2D.addEventListener('mousemove', drag2D);
                    if (! event.shiftKey) {
                        for (var o in SELECTED) {
                            if (SELECTED[o] !== inter[0].object.parent) {
                                SELECTED[o].unselect();
                            }
                        }
                        SELECTED = [];
                    } 
                    SELECTED.push(inter[0].object.parent);
                }
            }
        });

        this.domElement3D.addEventListener('mousedown', function(event) {
            self.camera3D.updateMouseDown(event);
            self.domElement3D.addEventListener('mousemove', moveAction3D);
        });

        // WHEN USER RELEASE CLIC
        this.domElement2D.addEventListener('mouseup', function(event) {
            event.preventDefault();
            self.domElement2D.removeEventListener('mousemove', moveAction2D);
            DRAGGED = null;
            self.domElement2D.removeEventListener('mousemove', drag2D);
        });
        this.domElement3D.addEventListener('mouseup', function(event) {
            event.preventDefault();
            self.domElement3D.removeEventListener('mousemove', moveAction3D);
        });

        // WHEN MOUSE GET OUT OF THE DRAWING ZONE
        this.domElement2D.addEventListener('mouseout', function(event) {
            self.domElement2D.removeEventListener('mousemove', moveAction2D);
        });
        this.domElement3D.addEventListener('mouseout', function(event) {
            self.domElement3D.removeEventListener('mousemove', moveAction3D);
        });

    };
    // END BIND EVENTS


    // CAMERAS
    var Camera2d = {

        initPosition: function() {
            this.ZOOM_MIN = 1;
            this.ZOOM_MAX = 7;
            this.xMin = this.right;
            this.xMax = this.left;
            this.yMin = this.top;
            this.yMax = this.bottom;
            this.rotation.set(0, 0, Math.PI);
            this.position.z = 20;
            this.position.y = 0;
            this.position.x = 0;
        },

        updateRadious: function(delta) {
            this.zoom += delta * 0.01;
            this.zoom = this.zoom > this.ZOOM_MAX ? this.ZOOM_MAX : this.zoom;
            this.zoom = this.zoom < this.ZOOM_MIN ? this.ZOOM_MIN : this.zoom;
            this.dontCrossBorders();
            this.updateProjectionMatrix();
        },

        updatePosition: function(previousPos, actualPos) {
            this.position.x += (this.xMax) * (previousPos.x - actualPos.x) / this.zoom;
            this.position.y += (this.yMax) * (previousPos.y - actualPos.y) / this.zoom;
            this.dontCrossBorders();
        },

        /** Make sure camera doesn't go away from the scene.  */
        dontCrossBorders: function() {
            if (this.position.y > this.yMax  - (this.yMax / this.zoom))
                this.position.y = this.yMax - (this.yMax / this.zoom);
            if (this.position.y < this.yMin  - (this.yMin / this.zoom))
                this.position.y = this.yMin - (this.yMin / this.zoom);
            if (this.position.x > this.xMax  - (this.xMax / this.zoom))
                this.position.x = this.xMax - (this.xMax / this.zoom);
            if (this.position.x < this.xMin  - (this.xMin / this.zoom))
                this.position.x = this.xMin - (this.xMin / this.zoom);
        },
    };

    var Camera3d = {
        theta: 45,
        phi: 60,
        radious: 10,
        onMouseDownPosition: new THREE.Vector2(),
        onMouseDownTheta: 45,
        onMouseDownPhi: 60,

        initPosition: function() {
            this.updatePosition();
        },

        updatePosition: function() {
            this.position.x = this.radious * Math.sin( this.theta * Math.PI / 360 )
                                * Math.cos( this.phi * Math.PI / 360 );
            this.position.z = this.radious * Math.sin( this.phi * Math.PI / 360 );
            this.position.y = this.radious * Math.cos( this.theta * Math.PI / 360 )
                                * Math.cos( this.phi * Math.PI / 360 );
            this.up = new THREE.Vector3(0,0,1);
            this.lookAt( new THREE.Vector3(0, 0, 0) );
        },

        updateTheta: function( x ) {
            this.theta = ((x - this.onMouseDownPosition.x) * 0.5) + this.onMouseDownTheta;
        },

        updatePhi: function( y ) {
            this.phi = ((y - this.onMouseDownPosition.y) * 0.5) + this.onMouseDownPhi;
            this.phi = Math.min(180, Math.max(0, this.phi));
        },

        updateMouseDown: function(event) {
            this.onMouseDownTheta = this.theta;
            this.onMouseDownPhi = this.phi;
            this.onMouseDownPosition.x = event.clientX;
            this.onMouseDownPosition.y = event.clientY;
        },

        updateEvent: function(event) {
            this.updateTheta(event.clientX);
            this.updatePhi(event.clientY);
            this.updatePosition();
        },

        updateRadious: function(delta) {
            this.radious -= delta * 0.1;
            if ( 5 > this.radious ) 
                this.radious = 5;
            this.updatePosition();
        },
    };

    var WebglAvailable = function() {
        try {
            var canvas = document.createElement( 'canvas' );
            return !!( window.WebGLRenderingContext && (
                    canvas.getContext( 'webgl' ) ||
                    canvas.getContext( 'experimental-webgl' ) )
                );
        } catch ( e ) {
            return false;
        }
    };
    // END CAMERAS


    // SHAPES BY FACTORIES
    var LineFactory = {
        makeLine: function() {
            var line = new THREE.Object3D();
            // 1. Create hears and core
            // Hears allow to grab shape borders and redim it
            line.hears = [];
            line.hears.push(new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.5),
                    new THREE.MeshLambertMaterial({ color: 0x000000 })));
            line.hears[0].position.set(-0.7, 0, 0);
            line.hears.push(new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.5),
                    new THREE.MeshLambertMaterial({ color: 0x000000 })));
            line.hears[1].position.set(0.65, 0, 0);
            // Core is what the user works with
            line.core = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1),
                    new THREE.MeshLambertMaterial({ color: COLOR }));

            // 2. Add those to the Object
            line.add(line.core);
            line.add(line.hears[0]);
            line.add(line.hears[1]);

            // 3. Define custom methods for shape
            line.select = function() {
                for (var h in line.hears) {
                    line.hears[h].visible = true;
                }
            };

            line.unselect = function() {
                for (var h in line.hears) {
                    line.hears[h].visible = false;
                }
            };

            var hover = function() {
                this.currentHex = this.material.emissive.getHex();
                this.material.emissive.setHex(0xff0000);
            };
            var hoverhear = function() {
                this.currentHex = this.material.emissive.getHex();
                this.material.emissive.setHex(0xff0000);
                this.parent.core.hover();
            };

            var unhover = function() {
                this.material.emissive.setHex(this.currentHex);
            };
            var unhoverhear = function() {
                this.material.emissive.setHex(this.currentHex);
                this.parent.core.unhover();
            };

            line.core.hover = hover;
            line.core.unhover = unhover;
            line.hears[0].hover = hoverhear;
            line.hears[0].unhover = unhoverhear;
            line.hears[1].hover = hoverhear;
            line.hears[1].unhover = unhoverhear;

            line.updatePosition = function() {
                var distToLeftHear = new THREE.Vector3();
                var hearLeft = this.hears[0],
                    hearRight = this.hears[1];
                distToLeftHear.copy(hearLeft.position);
                hearLeft.position.set(0, 0, 0);
                hearLeft.rotation.z = 0;
                hearRight.rotation.z = 0;
                hearRight.position.z = 0;
                this.translateX(distToLeftHear.x);
                this.translateY(distToLeftHear.y);
                hearRight.translateX(-distToLeftHear.x);
                hearRight.translateY(-distToLeftHear.y);
                this.core.position.set(0, 0, 0);
                // 2
                this.core.scale.x = lineLenght(hearLeft.position,
                                                hearRight.position) - 0.2;
                // 3
                var posB = hearRight.position;
                var rotationZ = (posB.x != 0 ? Math.atan(posB.y / posB.x) : Math.PI / 2);
                hearRight.rotation.z = rotationZ;
                hearLeft.rotation.z = rotationZ;
                this.core.rotation.set(0, 0, rotationZ); 
                // 4
                this.core.position.setX(hearRight.position.x / 2);
                this.core.position.setY(hearRight.position.y / 2);
                // 5
                //this.UpdateTextPosition();
            };
            
            var drag2D = function(point) {
                this.position.set(point.x - this.parent.position.x,
                                  point.y - this.parent.position.y,
                                  this.position.z);
                this.parent.updatePosition();
            };

            line.hears[0].drag2D = drag2D;
            line.hears[1].drag2D = drag2D;
            line.core.drag2D = function(point) {
                this.parent.position.set(point.x,
                                  point.y,
                                  this.parent.position.z);
            };

            return line;
        },
    };

    var LineArrowFactory = {
        makeLine: function() {
            var line = new THREE.Object3D();
            // 1. Create hears and core
            // Hears allow to grab shape borders and redim it
            line.hears = [];
            var coneGeometry = new THREE.CylinderGeometry(0, 0.2, 0.5, 8, 1);
            line.hears.push(new THREE.Mesh(coneGeometry,
                    new THREE.MeshLambertMaterial({ color: COLOR })));
            line.hears[0].position.set(-0.7, 0, 0);
            line.hears.push(new THREE.Mesh(coneGeometry,
                    new THREE.MeshLambertMaterial({ color: COLOR })));
            line.hears[1].position.set(0.65, 0, 0);
            // Core is what the user works with
            line.core = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.1, 0.1, 1, 3, 1),
                    new THREE.MeshLambertMaterial({ color: COLOR }));

            // 2. Add those to the Object
            line.add(line.core);
            line.add(line.hears[0]);
            line.add(line.hears[1]);

            // 3. Define custom methods for shape
            line.select = function() { };
            line.unselect = function() { };

            var hover = function() {
                this.currentHex = this.material.emissive.getHex();
                this.material.emissive.setHex(0xff0000);
            };
            var hoverhear = function() {
                this.currentHex = this.material.emissive.getHex();
                this.material.emissive.setHex(0xff0000);
                this.parent.core.hover();
            };

            var unhover = function() {
                this.material.emissive.setHex(this.currentHex);
            };
            var unhoverhear = function() {
                this.material.emissive.setHex(this.currentHex);
                this.parent.core.unhover();
            };

            line.core.hover = hover;
            line.core.unhover = unhover;
            line.hears[0].hover = hoverhear;
            line.hears[0].unhover = unhoverhear;
            line.hears[1].hover = hoverhear;
            line.hears[1].unhover = unhoverhear;

            line.updatePosition = function() {
                // 1
                var hearLeft = this.hears[0],
                    hearRight = this.hears[1];
                var distToLeftHear = new THREE.Vector3();
                distToLeftHear.copy(hearLeft.position);
                hearLeft.position.set(0, 0, 0);
                hearLeft.rotation.z = 0;
                hearRight.rotation.z = 0;
                hearRight.position.z = 0;
                this.translateX(distToLeftHear.x);
                this.translateY(distToLeftHear.y);
                hearRight.translateX(-distToLeftHear.x);
                hearRight.translateY(-distToLeftHear.y);
                this.core.position.set(0, 0, 0);
                // 2
                this.core.scale.y = lineLenght(hearLeft.position,
                                                hearRight.position);
                // 3
                var posB = hearRight.position;
                var rotationZ = (posB.x != 0 ? Math.atan(posB.y / posB.x) : Math.PI / 2);
                var delta = Math.PI / 2;
                if (hearRight.position.x < 0) 
                    delta = - delta;
                hearRight.rotation.z = rotationZ - delta;
                hearLeft.rotation.z = rotationZ + delta;
                this.core.rotation.set(0, 0, rotationZ + Math.PI / 2); 
                // 4
                this.core.position.setX(hearRight.position.x / 2);
                this.core.position.setY(hearRight.position.y / 2);
                // TODO
                //this.NoticeListeners();
            };
            
            var drag2D = function(point) {
                this.position.set(point.x - this.parent.position.x,
                                  point.y - this.parent.position.y,
                                  this.position.z);
                this.parent.updatePosition();
            };

            line.hears[0].drag2D = drag2D;
            line.hears[1].drag2D = drag2D;
            line.core.drag2D = function(point) {
                this.parent.position.set(point.x,
                                  point.y,
                                  this.parent.position.z);
            };

            /**
             * @desc Return the lenght of the line between given 2 points
             * @param point1
             * @param point2
             * @return float
             */
            var lineLenght = function(point1, point2) {
                return Math.sqrt(Math.pow(point1.y - point2.y, 2) + 
                                 Math.pow(point1.x - point2.x, 2)) - 0.2;
            };

            line.updatePosition();
            return line;
        },
    };
    // END SHAPES BY FACTORIES

    
    // TOOLS
    /**
     * @desc Return the lenght of the line between given 2 points
     * @param point1
     * @param point2
     * @return float
     */
    var lineLenght = function(point1, point2) {
        return Math.sqrt(Math.pow(point1.y - point2.y, 2) + 
                         Math.pow(point1.x - point2.x, 2)) - 0.2;
    };
    // END TOOLS

}(_));
