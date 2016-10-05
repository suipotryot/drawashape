(function(QUnit) {

    /**
     * @desc Scene default values
     */
    QUnit.test("Scene constructor default values", function(assert) {
        // Assignation
        var expected = {
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
    
        // Action
        var s = new Scene();
    
        // Assertion
        assert.deepEqual(s.options, expected);
    });

    /**
     * @desc Scene overloaded values
     */
    QUnit.test("Scene constructor options given values", function(assert) {
        // Assignation
        var expected = {
            ambiantLightShow: true,
            ambiantLightColor: 0x505050,

            axisHelperShow: true,
            axisHelperSize: 5,

            cam2Dleft: 88,
            cam2Dright: -20,
            cam2Dtop: -10,
            cam2Dbottom: 10,
            cam2Dnear: 0.1,
            cam2Dfar: 100,

            cam3Dfov: 66,
            cam3Daspect: 2,
            cam3Dnear: 1,
            cam3Dfar: 1000,

            gridHelperShow: true,
            gridHelperSize: 10,
            gridHelperStep: 1,
        };
    
        // Action
        var s = new Scene({cam2Dleft: 88, cam3Dfov: 66});
    
        // Assertion
        assert.deepEqual(s.options, expected);
    });

    /**
     * @desc setColor and getcolor methods
     */
    QUnit.test("Scene.setColor and getColor", function(assert) {
        // Assignation
        var s = new Scene();
    
        // Action
        s.setColor(0x050505);
    
        // Assertion
        assert.equal(s.getColor(), 0x050505);
    });

    /**
     * @desc scene.setDimension with object
     */
    QUnit.test("Scene.setDimension with object", function(assert) {
        // Assignation
        var s = new Scene();
    
        // Action
        s.setDimension({height: 12, stroke: 15, width: 11});
    
        // Assertion
        assert.equal(s.getDimension("height"), 12);
        assert.equal(s.getDimension("stroke"), 15);
        assert.equal(s.getDimension("width"), 11);
    });

    /**
     * @desc setDrawType and getDimension
     */
    QUnit.test("Scene.setDrawType and getDrawType", function(assert) {
        // Assignation
        var s = new Scene();
    
        // Action
        s.setDrawType("rect");
    
        // Assertion
        assert.equal(s.getDrawType(), "rect");
    });

    QUnit.test("Scene.getSelection afer a line was added", function(assert) {
        // Assignation
        var s = new Scene();
    
        // Action
        s.addLine({x: 0, y: 0});
    
        // Assertion
        assert.equal(s.getSelection().length, 1);
    });

    QUnit.test("Scene.getSelection for multiple selection", function(assert) {
        // Assignation
        var s = new Scene();
    
        // Action
        for (var i = 0, len = 10; i < len; i++) {
            s.addLine({x: i, y: i});
        }
        s.selectAll();
    
        // Assertion
        assert.equal(s.getSelection().length, 10);
    });

    QUnit.test("Scene.getSelectionByParams by color", function(assert) {
        // Assignation
        var s = new Scene();
    
        // Action
        s.setColor(0x888888);
        for (var i = 0, len = 4; i < len; i++) {
            s.addLine({x: i, y: i});
        }
        s.setColor(0x444444);
        for (var i = 0, len = 7; i < len; i++) {
            s.addLine({x: i, y: i});
        }
        s.selectAll()
    
        // Assertion
        assert.equal(s.getSelectionByParams({color: 0x888888}).length, 4);
        assert.equal(s.getSelectionByParams({color: 0x444444}).length, 7);
        assert.equal(s.getSelectionByParams({color: 0xffffff}).length, 0);
    });

    QUnit.test("Scene.getSelectionByParams by type", function(assert) {
        // Assignation
        var s = new Scene();
    
        // Action
        for (var i = 0, len = 4; i < len; i++) {
            s.addLine({x: i, y: i});
        }
        s.selectAll()
    
        // Assertion
        assert.equal(s.getSelectionByParams({type: "line"}).length, 4);
    });

})(QUnit);
