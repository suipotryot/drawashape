(function(_) {
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

            cam3Dfov: 70,
            cam3Daspect: 2,
            cam3Dnear: 1,
            cam3Dfar: 100000,

            gridHelperShow: true,
            gridHelperSize: 10,
            gridHelperStep: 1,
        };
        
        // Variable to know when user is handling the click in 3D zone
        this.handling3D = false;

        this.threeScene = new THREE.Scene();

        // Create options by extending defaults
        this.options = _.extend(defaults, options);

        // Set the Camera 2D of the scene
        this.camera2D = new Camera2d(this.options.cam2Dleft,
                                        this.options.cam2Dright,
                                        this.options.cam2Dtop,
                                        this.options.cam2Dbottom,
                                        this.options.cam2Dnear,
                                        this.options.cam2Dfar);
        this.threeScene.add(this.camera2D);

        // Set the Camera 3D of the scene
        this.camera3D = _.extend(new THREE.PerspectiveCamera(
                                        this.options.cam3Dfov,
                                        this.options.cam3Daspect,
                                        this.options.cam3Dnear,
                                        this.options.cam3Dfar),
                                Camera3d);
        this.camera3D.updatePosition();
        this.threeScene.add(this.camera3D);

        // Set the Grid Helper of the scene
        if (this.options.gridHelperShow) {
            this.threeScene.add(new THREE.GridHelper(
                this.options.gridHelperSize,
                this.options.gridHelperStep));
        }

        // Set the Axis Helper of the scene
        if (this.options.axisHelperShow) {
            this.threeScene.add(new THREE.AxisHelper(
                this.options.axisHelperSize));
        }

        // Set the ambiant light of the scene
        if (this.options.ambiantLightShow) {
            this.threeScene.add(new THREE.AmbientLight(
                this.options.ambiantLightColor));
        }

        // Set the spot light of the scene
        var light = new THREE.SpotLight( 0xffffff, 0.7 );
        light.position.set(0, 500, 2000);
        light.castShadow = true;
        light.shadowCameraNear = 200;
        light.shadowCameraFar = 1000;
        light.shadowCameraFov = 50;
        light.shadowBias = -0.00022;
        light.shadowMapWidth = 2048;
        light.shadowMapHeight = 2048;
        this.threeScene.add(light);

        // Set the plane of the scene (used for intersect detection)
        this.threeScene.add(new THREE.Mesh(
            new THREE.PlaneBufferGeometry( 40, 20, 8, 8 ),
            new THREE.MeshBasicMaterial( { visible: false } )
        ));

        // The Renderer
        if (WebglAvailable()) {
            this.renderer2D = new THREE.WebGLRenderer({
                preserveDrawingBuffer: true,
            });
            this.renderer3D = new THREE.WebGLRenderer({
                preserveDrawingBuffer: true,
            });
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

        var moveAction = function(event) {
                if (self.handling3D) {
                    self.camera3D.updateEvent(event);
                    self.camera3D.updateMatrix();
                }
            };

        // WHEN USER CLIC
        this.domElement3D.addEventListener('mousedown', function(event) {
            if (self.handling3D)
                return;
            self.handling3D = true;
            self.camera3D.updateMouseDown(event);
            self.domElement3D.addEventListener('mousemove', moveAction);
        });

        // WHEN USER RELEASE CLIC
        this.domElement3D.addEventListener('mouseup', function(event) {
            if (! self.handling3D)
                return;
            self.handling3D = false;
            self.domElement3D.removeEventListener('mousemove', moveAction);
        });

        // WHEN MOUSE GET OUT OF THE DRAWING ZONE
        this.domElement3D.addEventListener('mouseout', function(event) {
            if (! self.handling3D)
                return;
            self.handling3D = false;
            self.domElement3D.removeEventListener('mousemove', moveAction);
        });

    };

    Scene.prototype.draw2Din = function(el) {
        el.appendChild(this.domElement2D);
    };

    Scene.prototype.draw3Din = function(el) {
        el.appendChild(this.domElement3D);
    };

    var Camera2d = _.extend(THREE.OrthographicCamera,
            function(left, right, top, bottom, near, far) {
        this.xMin = right;
        this.xMax = left;
        this.yMin = top;
        this.yMax = bottom;
        this.rotation.set(0, 0, Math.PI);
        this.position.z = 20;
        this.position.y = 0;
        this.position.x = 0;

        this.UpdateRadious = function(delta) {
            this.zoom += delta * 0.01;
            this.zoom = this.zoom > ZOOM_MAX ? ZOOM_MAX : this.zoom;
            this.zoom = this.zoom < ZOOM_MIN ? ZOOM_MIN : this.zoom;
            this.DontCrossBorders();
            this.updateProjectionMatrix();
        };

        this.updatePosition = function(previousPos, actualPos) {
            this.position.x += (this.xMax) * (previousPos.x - actualPos.x) / this.zoom;
            this.position.y += (this.yMax) * (previousPos.y - actualPos.y) / this.zoom;
            this.DontCrossBorders();
        };

        /** Make sure camera doesn't go away from the scene.  */
        this.DontCrossBorders = function() {
            if (this.position.y > this.yMax  - (this.yMax / this.zoom))
                this.position.y = this.yMax - (this.yMax / this.zoom);
            if (this.position.y < this.yMin  - (this.yMin / this.zoom))
                this.position.y = this.yMin - (this.yMin / this.zoom);
            if (this.position.x > this.xMax  - (this.xMax / this.zoom))
                this.position.x = this.xMax - (this.xMax / this.zoom);
            if (this.position.x < this.xMin  - (this.xMin / this.zoom))
                this.position.x = this.xMin - (this.xMin / this.zoom);
        };
    });

    var Camera3d = {
        theta: 45,
        phi: 60,
        radious: 10,
        onMouseDownPosition: new THREE.Vector2(),
        onMouseDownTheta: 45,
        onMouseDownPhi: 60,

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

}(_));
