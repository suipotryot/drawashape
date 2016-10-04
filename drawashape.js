(function(_) {
    current_selected = null;
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

        // Set the ambiant light of the scene
        if (this.options.ambiantLightShow) {
            this.ambiantLight = new THREE.AmbientLight(0x505050);
            //this.threeScene.add(new THREE.AmbientLight( 0x404040, 100));
            this.threeScene.add(this.ambiantLight);
        }

        // Set the spot light of the scene
        //var light = new THREE.SpotLight( 0xffffff, 0.7 );
        //light.position.set(0, 500, 2000);
        //light.castShadow = true;
        //light.shadowCameraNear = 200;
        //light.shadowCameraFar = 1000;
        //light.shadowCameraFov = 50;
        //light.shadowBias = -0.00022;
        //light.shadowMapWidth = 2048;
        //light.shadowMapHeight = 2048;
        //this.threeScene.add(light);

        // Set the plane of the scene (used for intersect detection)
        this.plane = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( 40, 20, 8, 8 ),
            new THREE.MeshBasicMaterial( { visible: false } )
        );
        this.threeScene.add(this.plane);

        // The Renderer
        if (WebglAvailable()) {
            this.renderer2D = new THREE.WebGLRenderer({
                preserveDrawingBuffer: true,
            });
            this.renderer2D.setSize(window.innerWidth, window.innerHeight);
            this.renderer3D = new THREE.WebGLRenderer({
                preserveDrawingBuffer: true,
            });
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

        this.bindEvents();

    };

    // BIND EVENTS
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

        // WHEN USER CLIC
        this.domElement2D.addEventListener('mousedown', function(event) {
            // Move camera on mouse3 + move
            if (! event.ctrlKey && 4 != event.buttons)
                return;
            self.previousCam2DPos = getMousePosition(event);
            self.domElement2D.addEventListener('mousemove', moveAction2D);
        });
        this.domElement3D.addEventListener('mousedown', function(event) {
            self.camera3D.updateMouseDown(event);
            self.domElement3D.addEventListener('mousemove', moveAction3D);
        });

        // WHEN USER RELEASE CLIC
        this.domElement2D.addEventListener('mouseup', function(event) {
            event.preventDefault();
            self.domElement2D.removeEventListener('mousemove', moveAction2D);
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

    Scene.prototype.draw2Din = function(el) {
        el.appendChild(this.domElement2D);
    };

    Scene.prototype.draw3Din = function(el) {
        el.appendChild(this.domElement3D);
    };

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
            console.log(previousPos);
            console.log(actualPos);
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

    Scene.prototype.intersectPlane = function() {
        this.raycaster.setFromCamera(this, this.camera2D);
        var intersects = this.raycaster.intersectObject(this.plane);
        return intersects[0];
    };

    /**
     * Return an Shape containing mouse interseciton with the fisrt met target
     * in given list.
     */
    Scene.prototype.intersectAny = function() {
        this.raycaster.setFromCamera(this, this.camera2D);
        var intersects = this.raycaster.intersectObjects(this.threeScene.children, true);
        for (var i = 0; i < intersects.length; i++) {
            // TODO
            if (intersects[i].object.isADrawing) {
                return  intersects[i].object;
            }
        }
        return null;
    };
}(_));
